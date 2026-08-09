import dotenv from 'dotenv';
dotenv.config();

import {
  PrismaClient,
  NotificationType,
  DeviceType,
} from '../src/generated/prisma/client';
import { faker } from '@faker-js/faker';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';

const prismaPg = new PrismaPg({
  connectionString: process.env.DATABASE_URL || '',
});

const prisma = new PrismaClient({ adapter: prismaPg });

const SEED_PASSWORD = 'Password123!';

function uniquePairs<A, B>(as: A[], bs: B[], count: number): [A, B][] {
  const seen = new Set<string>();
  const pairs: [A, B][] = [];
  let attempts = 0;
  const maxAttempts = count * 20;

  while (pairs.length < count && attempts < maxAttempts) {
    attempts++;
    const a = faker.helpers.arrayElement(as);
    const b = faker.helpers.arrayElement(bs);
    const key = `${a}-${b}`;
    if (seen.has(key)) continue;
    seen.add(key);
    pairs.push([a, b]);
  }
  return pairs;
}

async function main() {
  console.log('Seeding...');
  const hashedPassword = await bcrypt.hash(SEED_PASSWORD, 10);

  // Wipe in FK-safe order (children before parents)
  await prisma.notification.deleteMany();
  await prisma.playlistVideo.deleteMany();
  await prisma.playlist.deleteMany();
  await prisma.watchLater.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.video.deleteMany();
  await prisma.channel.deleteMany();
  await prisma.user.deleteMany();

  // --------- Primary user (yours) ---------------
  const primaryUser = await prisma.user.create({
    data: {
      name: 'Mohammed',
      email: 'test@example.com',
      password: hashedPassword,
      avatarUrl: faker.image.avatar(),
      deviceType: DeviceType.WEB,
    },
  });

  // --------- Random users ---------------
  const randomUserCount = 19;
  const randomUsers = [];
  for (let i = 0; i < randomUserCount; i++) {
    const user = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: hashedPassword,
        avatarUrl: faker.image.avatar(),
        deviceType: faker.helpers.arrayElement([
          DeviceType.ANDROID,
          DeviceType.IOS,
          DeviceType.WEB,
        ]),
      },
    });
    randomUsers.push(user);
  }
  const users = [primaryUser, ...randomUsers];
  console.log(
    `Created ${users.length} users. Password for all: ${SEED_PASSWORD}`,
  );

  // --------- Primary user's channel (guaranteed) ---------------
  const primaryChannel = await prisma.channel.create({
    data: {
      title: `${primaryUser.name}'s Channel`,
      description: faker.lorem.sentence(),
      thumbnailUrl: faker.image.urlPicsumPhotos(),
      channelImageUrl: faker.image.avatar(),
      userId: primaryUser.id,
    },
  });

  // --------- Random channels (subset of random users) ---------------
  const channelOwners = faker.helpers.arrayElements(
    randomUsers,
    Math.floor(randomUsers.length * 0.6),
  );
  const randomChannels = [];
  for (const owner of channelOwners) {
    const channel = await prisma.channel.create({
      data: {
        title: faker.company.name(),
        description: faker.lorem.sentence(),
        thumbnailUrl: faker.image.urlPicsumPhotos(),
        channelImageUrl: faker.image.avatar(),
        userId: owner.id,
      },
    });
    randomChannels.push(channel);
  }
  const channels = [primaryChannel, ...randomChannels];
  console.log(`Created ${channels.length} channels.`);

  // --------- Videos (guarantee the primary channel gets several) ---------------
  const videos = [];
  for (const channel of channels) {
    const isPrimary = channel.id === primaryChannel.id;
    const videoCount = isPrimary ? 6 : faker.number.int({ min: 1, max: 5 });
    for (let i = 0; i < videoCount; i++) {
      const video = await prisma.video.create({
        data: {
          title: faker.lorem.sentence({ min: 3, max: 8 }),
          description: faker.lorem.paragraph(),
          videoUrl:
            'https://res.cloudinary.com/dfuu4nifi/video/upload/v1785847942/kdapshryfdcfotw768vs.webm',
          duration: faker.number.int({ min: 30, max: 3600 }),
          size: faker.number.float({ min: 5, max: 500, fractionDigits: 2 }),
          isPublished: true,
          thumbnailUrl: faker.image.urlPicsumPhotos(),
          views: faker.number.int({ min: 0, max: 100000 }),
          channelId: channel.id,
        },
      });
      videos.push(video);
    }
  }
  const primaryVideos = videos.filter((v) => v.channelId === primaryChannel.id);
  console.log(
    `Created ${videos.length} videos (${primaryVideos.length} on the primary channel).`,
  );

  // --------- Comments ---------------
  const commentersOnPrimary = uniquePairs(randomUsers, primaryVideos, 8);
  for (const [user, video] of commentersOnPrimary) {
    await prisma.comment.create({
      data: {
        content: faker.lorem.sentence(),
        userId: user.id,
        videoId: video.id,
      },
    });
  }
  const commentPairs = uniquePairs(users, videos, 60);
  for (const [user, video] of commentPairs) {
    await prisma.comment
      .create({
        data: {
          content: faker.lorem.sentence(),
          userId: user.id,
          videoId: video.id,
        },
      })
      .catch(() => {});
  }

  // --------- Likes ---------------
  const likesOnPrimary = uniquePairs(randomUsers, primaryVideos, 10);
  for (const [user, video] of likesOnPrimary) {
    await prisma.like.create({ data: { userId: user.id, videoId: video.id } });
  }
  const likePairs = uniquePairs(users, videos, 80);
  for (const [user, video] of likePairs) {
    await prisma.like
      .create({ data: { userId: user.id, videoId: video.id } })
      .catch(() => {});
  }

  // --------- Subscriptions (guarantee subscribers to the primary channel) ---------------
  const primarySubscribers = faker.helpers.arrayElements(randomUsers, 8);
  for (const user of primarySubscribers) {
    await prisma.subscription.create({
      data: { userId: user.id, channelId: primaryChannel.id },
    });
  }
  const subscriptionPairs = uniquePairs(users, channels, 40);
  for (const [user, channel] of subscriptionPairs) {
    await prisma.subscription
      .create({ data: { userId: user.id, channelId: channel.id } })
      .catch(() => {});
  }
  console.log(`Primary channel has ${primarySubscribers.length}+ subscribers.`);

  // --------- WatchLater ---------------
  const watchLaterPairs = uniquePairs(users, videos, 30);
  for (const [user, video] of watchLaterPairs) {
    await prisma.watchLater
      .create({ data: { userId: user.id, videoId: video.id } })
      .catch(() => {});
  }

  // --------- Playlists (guarantee the primary user has one) ---------------
  const primaryPlaylist = await prisma.playlist.create({
    data: {
      title: 'My Favorites',
      description: faker.lorem.sentence(),
      isPublic: true,
      userId: primaryUser.id,
    },
  });
  const playlists = [primaryPlaylist];
  for (const user of randomUsers) {
    const playlistCount = faker.number.int({ min: 0, max: 2 });
    for (let i = 0; i < playlistCount; i++) {
      const playlist = await prisma.playlist.create({
        data: {
          title: faker.lorem.words(3),
          description: faker.lorem.sentence(),
          isPublic: faker.datatype.boolean(0.7),
          userId: user.id,
        },
      });
      playlists.push(playlist);
    }
  }

  // --------- PlaylistVideo ---------------
  for (const playlist of playlists) {
    const videoSample = faker.helpers.arrayElements(
      videos,
      faker.number.int({ min: 1, max: 8 }),
    );
    for (let i = 0; i < videoSample.length; i++) {
      await prisma.playlistVideo.create({
        data: { playlistId: playlist.id, videoId: videoSample[i].id, index: i },
      });
    }
  }
  console.log(`Created ${playlists.length} playlists.`);

  // --------- Notifications (guarantee some for the primary user) ---------------
  const notificationTypes = [
    NotificationType.LIKE,
    NotificationType.COMMENT,
    NotificationType.PLAYLIST,
    NotificationType.SUBSCRIPTION,
  ];
  for (let i = 0; i < 10; i++) {
    const actor = faker.helpers.arrayElement(randomUsers);
    await prisma.notification.create({
      data: {
        recipientId: primaryUser.id,
        actorId: actor.id,
        type: faker.helpers.arrayElement(notificationTypes),
        message: faker.lorem.sentence(),
        isRead: faker.datatype.boolean(0.4),
      },
    });
  }
  for (let i = 0; i < 40; i++) {
    const recipient = faker.helpers.arrayElement(randomUsers);
    let actor = faker.helpers.arrayElement(users);
    while (actor.id === recipient.id) {
      actor = faker.helpers.arrayElement(users);
    }
    await prisma.notification.create({
      data: {
        recipientId: recipient.id,
        actorId: actor.id,
        type: faker.helpers.arrayElement(notificationTypes),
        message: faker.lorem.sentence(),
        isRead: faker.datatype.boolean(0.4),
      },
    });
  }

  console.log(
    `Done. Log in as ${primaryUser.email} (password: ${SEED_PASSWORD}) to see a populated channel, videos, subscribers, and a playlist.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
