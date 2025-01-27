import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from 'src/shared/decorators/public.decorator';
import { ClsService } from 'nestjs-cls';
import { Observable, firstValueFrom } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private readonly cls: ClsService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const isAuth = await this.validateRequest(context);

    if (isAuth) {
      const request = context.switchToHttp().getRequest();
      const user = request.user;
      this.cls.set('user', user);
      this.cls.set('request', request);
    }

    return isAuth;
  }

  private async validateRequest(context: ExecutionContext): Promise<boolean> {
    const result = super.canActivate(context);

    if (result instanceof Observable) {
      return await firstValueFrom(result);
    }

    if (result instanceof Promise) {
      return await result;
    }

    return result;
  }

  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err;
    }
    return user;
  }
}
