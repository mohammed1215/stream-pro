import { applyDecorators, Type } from '@nestjs/common';
import { ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { SuccessResponseShape } from '../user/dto/ResponseShape.dto';

export function ApiSuccessResponse<TModel extends Type<any>>(model: TModel) {
  return applyDecorators(
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(SuccessResponseShape) },
          {
            properties: {
              data: { $ref: getSchemaPath(model) }, // Automatically injects the DTO here
            },
          },
        ],
      },
    }),
  );
}

export function ApiSuccessArrayResponse<TModel extends Type<any>>(
  model: TModel,
) {
  return applyDecorators(
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(SuccessResponseShape) },
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
            },
          },
        ],
      },
    }),
  );
}
