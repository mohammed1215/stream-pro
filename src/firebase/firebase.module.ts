import { Global, Module } from '@nestjs/common';
import { FirebaseService } from '../firebase/firbase.service';

@Global()
@Module({
  providers: [FirebaseService],
  exports: [FirebaseService],
})
export class FirebaseModule {}
