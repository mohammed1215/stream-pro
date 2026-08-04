import { ApiProperty } from '@nestjs/swagger';

export class SuccessResponseShape<T = unknown, Y = unknown> {
  @ApiProperty({ example: true })
  success: true = true as const;

  // Use a lazy resolver returning the JavaScript Object class
  @ApiProperty({ type: () => Object })
  data: T;

  // Do the same here. The 'required: false' boolean will now work perfectly!
  @ApiProperty({ type: () => Object, required: false })
  meta: Y;

  constructor(data: T, meta?: Y) {
    this.data = data;
    this.meta = meta ?? ({} as Y);
  }
}
