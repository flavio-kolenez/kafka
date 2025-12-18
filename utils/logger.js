// Logger helper centralizado para logs bonitos e organizados
export class Logger {
  static colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
  };

  static getTimestamp() {
    return new Date().toLocaleTimeString('pt-BR', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  static formatMessage(level, source, message, data = null) {
    const timestamp = this.getTimestamp();
    const spacing = ''.padStart(60, '─');
    
    console.log(`${this.colors.cyan}${spacing}${this.colors.reset}`);
    console.log(`${this.colors.bright}[${timestamp}] ${level} ${source}${this.colors.reset}`);
    console.log(``);
    console.log(`${message}`);
    
    if (data) {
      console.log(`${this.colors.dim}Data:${this.colors.reset}`, data);
    }
    
    console.log(`${this.colors.cyan}${spacing}${this.colors.reset}`);
  }

  // Log de sucesso
  static success(source, message, data = null) {
    const level = `${this.colors.green}✅ SUCCESS${this.colors.reset}`;
    this.formatMessage(level, source, `${this.colors.green}${message}${this.colors.reset}`, data);
  }

  // Log de erro
  static error(source, message, data = null) {
    const level = `${this.colors.red}❌ ERROR${this.colors.reset}`;
    this.formatMessage(level, source, `${this.colors.red}${message}${this.colors.reset}`, data);
  }

  // Log de info
  static info(source, message, data = null) {
    const level = `${this.colors.blue}ℹ️  INFO${this.colors.reset}`;
    this.formatMessage(level, source, `${this.colors.blue}${message}${this.colors.reset}`, data);
  }

  // Log de warning
  static warn(source, message, data = null) {
    const level = `${this.colors.yellow}⚠️  WARN${this.colors.reset}`;
    this.formatMessage(level, source, `${this.colors.yellow}${message}${this.colors.reset}`, data);
  }

  // Log de debug/desenvolvimento
  static debug(source, message, data = null) {
    const level = `${this.colors.magenta}🐛 DEBUG${this.colors.reset}`;
    this.formatMessage(level, source, `${this.colors.magenta}${message}${this.colors.reset}`, data);
  }

  // Log específico para Kafka
  static kafka(action, topic, message, data = null) {
    const level = `${this.colors.cyan}📡 KAFKA${this.colors.reset}`;
    const kafkaMessage = `${action} → Topic: ${this.colors.bright}${topic}${this.colors.reset} | ${message}`;
    this.formatMessage(level, 'KAFKA', kafkaMessage, data);
  }

  // Log para validações
  static validation(result, source, message, data = null) {
    const emoji = result ? '✅' : '❌';
    const color = result ? this.colors.green : this.colors.red;
    const level = `${color}${emoji} VALIDATION${this.colors.reset}`;
    this.formatMessage(level, source, `${color}${message}${this.colors.reset}`, data);
  }

  // Função para agrupar múltiplas validações em um bloco
  static groupValidation(source, validations) {
    const timestamp = this.getTimestamp();
    const spacing = ''.padStart(60, '─');
    
    console.log(`${this.colors.cyan}${spacing}${this.colors.reset}`);
    console.log(`${this.colors.bright}[${timestamp}] ${this.colors.green}✅ VALIDATION${this.colors.reset} ${source}${this.colors.reset}`);
    console.log(``);
    
    validations.forEach(validation => {
      const emoji = validation.result ? '✅' : '❌';
      const color = validation.result ? this.colors.green : this.colors.red;
      console.log(`${color}${emoji} ${validation.message}${this.colors.reset}`);
      
      if (validation.data) {
        console.log(`${this.colors.dim}   Data:${this.colors.reset}`, validation.data);
      }
    });
    
    console.log(`${this.colors.cyan}${spacing}${this.colors.reset}`);
  }

  // Log simples sem formatação especial
  static simple(message) {
    console.log(`${this.colors.dim}${message}${this.colors.reset}`);
  }

  // Log simples de sucesso para startup
  static simpleSuccess(message) {
    console.log(`${this.colors.green}✅ ${message}${this.colors.reset}`);
  }

  // Separador visual
  static separator(title = '') {
    const line = ''.padStart(60, '═');
    console.log(`\n${this.colors.bright}${line}${this.colors.reset}`);
    if (title) {
      console.log(`${this.colors.bright}${title.toUpperCase().padStart(title.length + 30)}${this.colors.reset}`);
      console.log(`${this.colors.bright}${line}${this.colors.reset}`);
    }
  }
}