import { Injectable, inject } from '@angular/core';
import { ConfigService } from './config.service';
import { environment } from '../../../environments/environment';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private configService = inject(ConfigService);
  private readonly CONTEXT = 'DINNR';
  private readonly logBuffer: LogEntry[] = [];
  private readonly MAX_BUFFER_SIZE = 100;

  constructor() {}

  /**
   * Log debug message
   */
  debug(message: string, data?: any, context?: string): void {
    this.log('debug', message, data, context);
  }

  /**
   * Log info message
   */
  info(message: string, data?: any, context?: string): void {
    this.log('info', message, data, context);
  }

  /**
   * Log warning message
   */
  warn(message: string, data?: any, context?: string): void {
    this.log('warn', message, data, context);
  }

  /**
   * Log error message
   */
  error(message: string, data?: any, context?: string): void {
    this.log('error', message, data, context);
  }

  /**
   * Log message with specified level
   */
  private log(level: LogLevel, message: string, data?: any, context?: string): void {
    const config = this.configService.getConfigValue('logging');
    if (!config || this.shouldLog(level, config.level)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message: this.sanitizeMessage(message),
      context: context || this.CONTEXT,
      data: data ? this.sanitizeData(data) : undefined
    };

    // Add to buffer
    this.addToBuffer(entry);

    // Console output (only in development or for errors)
    if (config.enableConsole && (!environment.production || level === 'error')) {
      this.logToConsole(entry);
    }

    // In production, send to logging service for errors and warnings
    if (environment.production && (level === 'error' || level === 'warn')) {
      this.sendToLoggingService(entry);
    }
  }

  /**
   * Check if message should be logged based on level
   */
  private shouldLog(messageLevel: LogLevel, configLevel: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const messageIndex = levels.indexOf(messageLevel);
    const configIndex = levels.indexOf(configLevel);
    return messageIndex >= configIndex;
  }

  /**
   * Add entry to log buffer
   */
  private addToBuffer(entry: LogEntry): void {
    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.MAX_BUFFER_SIZE) {
      this.logBuffer.shift();
    }
  }

  /**
   * Log to console with formatting
   */
  private logToConsole(entry: LogEntry): void {
    const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.context}]`;
    const message = `${prefix} ${entry.message}`;

    switch (entry.level) {
      case 'debug':
        console.debug(message, entry.data || '');
        break;
      case 'info':
        console.log(message, entry.data || '');
        break;
      case 'warn':
        console.warn(message, entry.data || '');
        break;
      case 'error':
        console.error(message, entry.data || '');
        break;
    }
  }

  /**
   * Send log entry to logging service (in production)
   */
  private sendToLoggingService(entry: LogEntry): void {
    // In a real implementation, this would send to a logging service
    // For now, we'll just keep it in memory for debugging
    console.log('[LoggingService]', entry); // Use the entry parameter
    if (navigator.onLine) {
      // Could implement sending to external logging service here
      // fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(entry)
      // }).catch(error => {
      //   console.warn('Failed to send log to service:', error);
      // });
    }
  }

  /**
   * Sanitize message to prevent sensitive data exposure
   */
  private sanitizeMessage(message: string): string {
    // Remove potential sensitive information
    const sensitivePatterns = [
      /PUBG_API_KEY=[\w\-_.]+/gi,
      /key\s*[:=]\s*['"]?\w+['"]?/gi,
      /password\s*[:=]\s*['"][^'"]+['"]/gi,
      /token\s*[:=]\s*['"][^'"]+['"]/gi,
      /auth\s*[:=]\s*['"][^'"]+['"]/gi,
      /secret\s*[:=]\s*['"][^'"]+['"]/gi
    ];

    let sanitized = message;
    sensitivePatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    });

    return sanitized;
  }

  /**
   * Sanitize data object to prevent sensitive data exposure
   */
  private sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sensitiveKeys = [
      'password', 'pass', 'pwd', 'secret', 'token', 'key', 'auth',
      'authorization', 'apikey', 'api_key', 'pubg_api_key'
    ];

    const sanitized = { ...data };

    Object.keys(sanitized).forEach(key => {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeData(sanitized[key]);
      }
    });

    return sanitized;
  }

  /**
   * Get recent logs for debugging
   */
  getRecentLogs(count: number = 50): LogEntry[] {
    return this.logBuffer.slice(-count);
  }

  /**
   * Clear log buffer
   */
  clearLogs(): void {
    this.logBuffer.length = 0;
  }

  /**
   * Export logs for debugging
   */
  exportLogs(): string {
    return JSON.stringify(this.logBuffer, null, 2);
  }

  /**
   * Create context-specific logger
   */
  createLogger(context: string): LoggerService {
    return {
      debug: (message: string, data?: any) => this.debug(message, data, context),
      info: (message: string, data?: any) => this.info(message, data, context),
      warn: (message: string, data?: any) => this.warn(message, data, context),
      error: (message: string, data?: any) => this.error(message, data, context),
      getRecentLogs: () => this.getRecentLogs(),
      clearLogs: () => this.clearLogs(),
      exportLogs: () => this.exportLogs(),
      createLogger: (ctx: string) => this.createLogger(ctx)
    } as LoggerService;
  }
}