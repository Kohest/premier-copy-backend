import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { MoviesModule } from './movies/movies.module';
import { SeriesModule } from './series/series.module';
import { ContentModule } from './content/content.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { FileModule } from './file/file.module';
import { FavoriteModule } from './favorite/favorite.module';
import { GenreModule } from './genre/genre.module';
import { ReviewModule } from './review/review.module';
import { CollectionModule } from './collection/collection.module';
import { PaymentModule } from './payment/payment.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { TrailerModule } from './trailer/trailer.module';
import { BannerModule } from './banner/banner.module';
import * as path from 'path';

@Module({
  imports: [
    UserModule,
    AuthModule,
    MoviesModule,
    SeriesModule,
    ContentModule,
    ServeStaticModule.forRoot({
      rootPath: path.resolve(__dirname, '..', 'uploads', 'static'),
      serveStaticOptions: {
        fallthrough: false,
      },
    }),
    FileModule,
    FavoriteModule,
    GenreModule,
    ReviewModule,
    CollectionModule,
    PaymentModule,
    SubscriptionModule,
    TrailerModule,
    BannerModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
