import { Global, Module } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firbase.service';

@Global()
@Module({
  providers: [FirebaseService],
  exports: [FirebaseService],
})
export class FirebaseModule {}
