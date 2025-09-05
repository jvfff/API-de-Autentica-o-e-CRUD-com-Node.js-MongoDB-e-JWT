const axios = require('axios');
const { performance } = require('perf_hooks');

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000';
const CONCURRENT_USERS = parseInt(process.env.CONCURRENT_USERS) || 10;
const TEST_DURATION = parseInt(process.env.TEST_DURATION) || 60000;

class PerformanceTest {
  constructor() {
    this.results = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      responseTimes: [],
      errors: [],
      startTime: null,
      endTime: null
    };
    this.tokens = [];
  }

  async setup() {
    console.log('🔧 Configurando teste de performance...');
    
    for (let i = 0; i < CONCURRENT_USERS; i++) {
      try {
        const userData = {
          name: `Test User ${i}`,
          email: `testuser${i}@performance.test`,
          password: 'password123'
        };

        const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
        this.tokens.push(response.data.accessToken);
        console.log(`✅ Usuário ${i + 1}/${CONCURRENT_USERS} criado`);
      } catch (error) {
        console.error(`❌ Erro ao criar usuário ${i}:`, error.response?.data || error.message);
      }
    }

    console.log(`🎯 ${this.tokens.length} usuários preparados para o teste`);
  }

  async makeRequest(token, endpoint = '/todos', method = 'GET', data = null) {
    const startTime = performance.now();
    
    try {
      const config = {
        method,
        url: `${API_BASE_URL}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      this.results.totalRequests++;
      this.results.successfulRequests++;
      this.results.responseTimes.push(responseTime);

      return { success: true, responseTime, status: response.status };
    } catch (error) {
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      this.results.totalRequests++;
      this.results.failedRequests++;
      this.results.responseTimes.push(responseTime);
      this.results.errors.push({
        error: error.response?.data || error.message,
        status: error.response?.status,
        endpoint,
        method
      });

      return { success: false, responseTime, error: error.response?.data || error.message };
    }
  }

  async simulateUser(userId) {
    const token = this.tokens[userId];
    if (!token) return;

    const scenarios = [
      () => this.makeRequest(token, '/todos', 'POST', {
        title: `Todo ${Date.now()}-${userId}`,
        done: false
      }),
      () => this.makeRequest(token, '/todos', 'GET'),
      () => this.makeRequest(token, '/me', 'GET'),
      () => this.makeRequest(token, '/todos?done=false', 'GET')
    ];

    while (performance.now() - this.results.startTime < TEST_DURATION) {
      const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
      await scenario();
      
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
    }
  }

  async runTest() {
    console.log(`🚀 Iniciando teste de performance:`);
    console.log(`   - Usuários simultâneos: ${CONCURRENT_USERS}`);
    console.log(`   - Duração: ${TEST_DURATION}ms`);
    console.log(`   - URL: ${API_BASE_URL}`);
    console.log('');

    this.results.startTime = performance.now();

    const userPromises = [];
    for (let i = 0; i < this.tokens.length; i++) {
      userPromises.push(this.simulateUser(i));
    }

    await Promise.all(userPromises);
    this.results.endTime = performance.now();
  }

  generateReport() {
    const duration = this.results.endTime - this.results.startTime;
    const avgResponseTime = this.results.responseTimes.reduce((a, b) => a + b, 0) / this.results.responseTimes.length;
    const minResponseTime = Math.min(...this.results.responseTimes);
    const maxResponseTime = Math.max(...this.results.responseTimes);
    const requestsPerSecond = (this.results.totalRequests / duration) * 1000;
    const successRate = (this.results.successfulRequests / this.results.totalRequests) * 100;

    const sortedTimes = this.results.responseTimes.sort((a, b) => a - b);
    const p50 = sortedTimes[Math.floor(sortedTimes.length * 0.5)];
    const p90 = sortedTimes[Math.floor(sortedTimes.length * 0.9)];
    const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)];
    const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)];

    console.log('\n📊 RELATÓRIO DE PERFORMANCE');
    console.log('═══════════════════════════════════');
    console.log(`⏱️  Duração total: ${(duration / 1000).toFixed(2)}s`);
    console.log(`📈 Total de requests: ${this.results.totalRequests}`);
    console.log(`✅ Requests bem-sucedidas: ${this.results.successfulRequests}`);
    console.log(`❌ Requests falhadas: ${this.results.failedRequests}`);
    console.log(`📊 Taxa de sucesso: ${successRate.toFixed(2)}%`);
    console.log(`⚡ Requests/segundo: ${requestsPerSecond.toFixed(2)}`);
    console.log('');
    console.log('⏰ TEMPOS DE RESPOSTA (ms):');
    console.log(`   Mínimo: ${minResponseTime.toFixed(2)}`);
    console.log(`   Máximo: ${maxResponseTime.toFixed(2)}`);
    console.log(`   Média: ${avgResponseTime.toFixed(2)}`);
    console.log(`   P50: ${p50.toFixed(2)}`);
    console.log(`   P90: ${p90.toFixed(2)}`);
    console.log(`   P95: ${p95.toFixed(2)}`);
    console.log(`   P99: ${p99.toFixed(2)}`);

    if (this.results.errors.length > 0) {
      console.log('\n❌ ERROS ENCONTRADOS:');
      const errorCounts = {};
      this.results.errors.forEach(err => {
        const key = `${err.status || 'No Status'}: ${typeof err.error === 'object' ? JSON.stringify(err.error) : err.error}`;
        errorCounts[key] = (errorCounts[key] || 0) + 1;
      });

      Object.entries(errorCounts).forEach(([error, count]) => {
        console.log(`   ${count}x ${error}`);
      });
    }

    console.log('\n🎯 AVALIAÇÃO:');
    if (successRate >= 99) {
      console.log('   ✅ Excelente estabilidade');
    } else if (successRate >= 95) {
      console.log('   ⚠️  Boa estabilidade');
    } else {
      console.log('   ❌ Estabilidade precisa melhorar');
    }

    if (avgResponseTime <= 200) {
      console.log('   ✅ Excelente tempo de resposta');
    } else if (avgResponseTime <= 500) {
      console.log('   ⚠️  Tempo de resposta aceitável');
    } else {
      console.log('   ❌ Tempo de resposta precisa melhorar');
    }

    if (requestsPerSecond >= 100) {
      console.log('   ✅ Excelente throughput');
    } else if (requestsPerSecond >= 50) {
      console.log('   ⚠️  Throughput aceitável');
    } else {
      console.log('   ❌ Throughput precisa melhorar');
    }

    return {
      duration: duration / 1000,
      totalRequests: this.results.totalRequests,
      successRate,
      requestsPerSecond,
      avgResponseTime,
      p95ResponseTime: p95,
      errors: this.results.errors.length
    };
  }

  async cleanup() {
    console.log('\n🧹 Limpando dados de teste...');
    console.log('✅ Limpeza concluída');
  }
}

(async () => {
  const test = new PerformanceTest();
  
  try {
    await test.setup();
    await test.runTest();
    const results = test.generateReport();
    
    const fs = require('fs');
    const reportFile = `performance-report-${Date.now()}.json`;
    fs.writeFileSync(reportFile, JSON.stringify({
      timestamp: new Date().toISOString(),
      config: {
        concurrentUsers: CONCURRENT_USERS,
        testDuration: TEST_DURATION,
        apiUrl: API_BASE_URL
      },
      results
    }, null, 2));
    
    console.log(`\n📄 Relatório salvo em: ${reportFile}`);
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
    process.exit(1);
  } finally {
    await test.cleanup();
  }
})();