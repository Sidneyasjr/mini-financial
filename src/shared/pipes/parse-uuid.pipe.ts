import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { isUUID } from 'class-validator';

@Injectable()
export class ParseUUIDWithoutFormatPipe implements PipeTransform<string> {
  transform(value: string): string {
    const cleanUUID = value.replace(/[^a-zA-Z0-9]/g, '');

    const formattedUUID = `${cleanUUID.slice(0, 8)}-${cleanUUID.slice(8, 12)}-${cleanUUID.slice(12, 16)}-${cleanUUID.slice(16, 20)}-${cleanUUID.slice(20)}`;

    if (!isUUID(formattedUUID, '4')) {
      throw new BadRequestException('Invalid UUID');
    }

    return formattedUUID;
  }
}
