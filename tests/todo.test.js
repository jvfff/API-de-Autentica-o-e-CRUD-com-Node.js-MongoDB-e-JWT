const request = require('supertest');
const app = require('../server');
const Todo = require('../models/Todo');
const { createTestUser, generateTestTokens } = require('./setup');

describe('Todos Routes', () => {
  let testUser, accessToken, refreshToken;

  beforeEach(async () => {
    testUser = await createTestUser();
    const tokens = generateTestTokens(testUser._id);
    accessToken = tokens.accessToken;
    refreshToken = tokens.refreshToken;
    
    testUser.refreshTokens.push({ token: refreshToken });
    await testUser.save();
  });

  describe('POST /todos', () => {
    test('should create a new todo successfully', async () => {
      const todoData = {
        title: 'Test Todo',
        done: false
      };

      const response = await request(app)
        .post('/todos')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(todoData)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('todo');
      expect(response.body.todo.title).toBe(todoData.title);
      expect(response.body.todo.done).toBe(todoData.done);
      expect(response.body.todo.owner.toString()).toBe(testUser._id.toString());
    });

    test('should not create todo without authentication', async () => {
      const todoData = {
        title: 'Test Todo',
        done: false
      };

      const response = await request(app)
        .post('/todos')
        .send(todoData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    test('should not create todo without title', async () => {
      const todoData = {
        done: false
      };

      const response = await request(app)
        .post('/todos')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(todoData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Dados inválidos');
    });

    test('should create todo with default done=false', async () => {
      const todoData = {
        title: 'Test Todo'
      };

      const response = await request(app)
        .post('/todos')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(todoData)
        .expect(201);

      expect(response.body.todo.done).toBe(false);
    });
  });

  describe('GET /todos', () => {
    beforeEach(async () => {
      await Todo.create([
        { title: 'Todo 1', done: false, owner: testUser._id },
        { title: 'Todo 2', done: true, owner: testUser._id },
        { title: 'Todo 3', done: false, owner: testUser._id }
      ]);
      
      const otherUser = await createTestUser({ email: 'other@example.com' });
      await Todo.create({
        title: 'Other User Todo',
        done: false,
        owner: otherUser._id
      });
    });

    test('should get user todos successfully', async () => {
      const response = await request(app)
        .get('/todos')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('todos');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.todos).toHaveLength(3);
      
      response.body.todos.forEach(todo => {
        expect(todo.owner).toBe(testUser._id.toString());
      });
    });

    test('should filter todos by done status', async () => {
      const response = await request(app)
        .get('/todos?done=true')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.todos).toHaveLength(1);
      expect(response.body.todos[0].done).toBe(true);
    });

    test('should paginate todos correctly', async () => {
      const response = await request(app)
        .get('/todos?page=1&limit=2')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.todos).toHaveLength(2);
      expect(response.body.pagination.current).toBe(1);
      expect(response.body.pagination.totalItems).toBe(3);
    });

    test('should not get todos without authentication', async () => {
      const response = await request(app)
        .get('/todos')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /todos/:id', () => {
    let testTodo;

    beforeEach(async () => {
      testTodo = await Todo.create({
        title: 'Test Todo',
        done: false,
        owner: testUser._id
      });
    });

    test('should get specific todo successfully', async () => {
      const response = await request(app)
        .get(`/todos/${testTodo._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('todo');
      expect(response.body.todo._id).toBe(testTodo._id.toString());
      expect(response.body.todo.title).toBe(testTodo.title);
    });

    test('should not get todo of other user', async () => {
      const otherUser = await createTestUser({ email: 'other@example.com' });
      const otherTodo = await Todo.create({
        title: 'Other User Todo',
        done: false,
        owner: otherUser._id
      });

      const response = await request(app)
        .get(`/todos/${otherTodo._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    test('should return 404 for non-existent todo', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .get(`/todos/${nonExistentId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    test('should return 400 for invalid todo ID', async () => {
      const response = await request(app)
        .get('/todos/invalid-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /todos/:id', () => {
    let testTodo;

    beforeEach(async () => {
      testTodo = await Todo.create({
        title: 'Test Todo',
        done: false,
        owner: testUser._id
      });
    });

    test('should update todo successfully', async () => {
      const updateData = {
        title: 'Updated Todo',
        done: true
      };

      const response = await request(app)
        .put(`/todos/${testTodo._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('todo');
      expect(response.body.todo.title).toBe(updateData.title);
      expect(response.body.todo.done).toBe(updateData.done);
    });

    test('should update only provided fields', async () => {
      const updateData = { done: true };

      const response = await request(app)
        .put(`/todos/${testTodo._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.todo.title).toBe(testTodo.title);
      expect(response.body.todo.done).toBe(true);
    });

    test('should not update todo of other user', async () => {
      const otherUser = await createTestUser({ email: 'other@example.com' });
      const otherTodo = await Todo.create({
        title: 'Other User Todo',
        done: false,
        owner: otherUser._id
      });

      const response = await request(app)
        .put(`/todos/${otherTodo._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Hacked' })
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /todos/:id', () => {
    let testTodo;

    beforeEach(async () => {
      testTodo = await Todo.create({
        title: 'Test Todo',
        done: false,
        owner: testUser._id
      });
    });

    test('should delete todo successfully', async () => {
      const response = await request(app)
        .delete(`/todos/${testTodo._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('todo');

      const deletedTodo = await Todo.findById(testTodo._id);
      expect(deletedTodo).toBeNull();
    });

    test('should not delete todo of other user', async () => {
      const otherUser = await createTestUser({ email: 'other@example.com' });
      const otherTodo = await Todo.create({
        title: 'Other User Todo',
        done: false,
        owner: otherUser._id
      });

      const response = await request(app)
        .delete(`/todos/${otherTodo._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      
      const stillExists = await Todo.findById(otherTodo._id);
      expect(stillExists).not.toBeNull();
    });

    test('should return 404 for non-existent todo', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .delete(`/todos/${nonExistentId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });
});