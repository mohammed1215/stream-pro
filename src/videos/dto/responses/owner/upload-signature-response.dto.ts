export class UploadSignatureResponseDto {
  signature!: string;
  timestamp!: number;
  apiKey!: string | undefined;
  folder!: string;
  eager!: any;
  eagerNotificationUrl!: any;
  eagerAsync!: boolean;
  uploadUrl!: string;
}
