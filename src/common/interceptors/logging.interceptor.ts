import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Logger } from '../utils/logger';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, query, params, ip } = request;
    const user = request.user?.id || 'anonymous';
    
    const startTime = Date.now();
    
    Logger.log(`[${method}] ${url} - User: ${user} - IP: ${ip}`, 'HTTP');
    
    if (Object.keys(body).length) {
      // Don't log passwords
      const safeBody = { ...body };
      if (safeBody.password) safeBody.password = '***';
      if (safeBody.newPassword) safeBody.newPassword = '***';
      Logger.debug(`Request Body: ${JSON.stringify(safeBody)}`, 'HTTP');
    }
    
    if (Object.keys(query).length) {
      Logger.debug(`Request Query: ${JSON.stringify(query)}`, 'HTTP');
    }
    
    if (Object.keys(params).length) {
      Logger.debug(`Request Params: ${JSON.stringify(params)}`, 'HTTP');
    }
    
    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          Logger.log(`[${method}] ${url} - ${duration}ms`, 'HTTP');
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          Logger.error(
            `[${method}] ${url} - ${duration}ms - Error: ${error.message}`,
            error.stack,
            'HTTP',
          );
        },
      }),
    );
  }
}