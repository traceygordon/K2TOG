// prisma/seed.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database…')

  // 1) Create users
  const usersData = [
    {
      name:      'Sarah Knits',
      email:     'sarah@example.com',
      password:  '$2b$10$G/M.7zrA8Zz0Zz0Zz0Zz0Zz0Zz0Zz0Zz0Zz0Zz0Zz0Zz0Zz0', // "password123"
      profile_pic: 'https://example.com/sarah.jpg',
      location:  'New York, NY',
    },
    {
      name:      'Mike Crochets',
      email:     'mike@example.com',
      password:  '$2b$10$G/M.7zrA8Zz0Zz0Zz0Zz0Zz0Zz0Zz0Zz0Zz0Zz0Zz0Zz0Zz0', // "password123"
      profile_pic: 'https://example.com/mike.jpg',
      location:  'Los Angeles, CA',
    },
    {
      name:      'Emma Yarns',
      email:     'emma@example.com',
      password:  '$2b$10$G/M.7zrA8Zz0Zz0Zz0Zz0Zz0Zz0Zz0Zz0Zz0Zz0Zz0Zz0Zz0', // "password123"
      profile_pic: 'https://example.com/emma.jpg',
      location:  'Chicago, IL',
    },
  ]

  const users = []
  for (const u of usersData) {
    users.push(
      await prisma.user.create({
        data: u
      })
    )
  }
  console.log(`  • Created ${users.length} users`)

  // helper to pick a random user
  const randomUser = () => users[Math.floor(Math.random() * users.length)]

  // 2) Seed Yarn + Listing
  const yarnListingsData = [
    {
      pictures:       ['https://example.com/yarn1.jpg'],
      brand:          'Malabrigo',
      amount:         2,
      length_yards:   400,
      weight:         'Worsted',
      color:          'Purple',
      composition:    '100% Merino Wool',
      quality:        'new',
      type:           'sell',
      price:          25.0,
      location:       'New York, NY',
      description:    'Beautiful hand-dyed merino wool yarn',
    },
    {
      pictures:       ['https://example.com/yarn2.jpg'],
      brand:          'Lion Brand',
      amount:         5,
      length_yards:   300,
      weight:         'DK',
      color:          'Blue',
      composition:    '100% Acrylic',
      quality:        'good',
      type:           'swap',
      price:          15.0,
      location:       'Los Angeles, CA',
      description:    'Great for baby blankets',
    },
  ]

  for (const y of yarnListingsData) {
    const owner = randomUser()
    const yarn = await prisma.yarn.create({
      data: {
        ...y,
        user: { connect: { id: owner.id } }
      }
    })

    await prisma.listing.create({
      data: {
        seller:       { connect: { id: owner.id } },
        listing_type: 'yarn',
        product_id:   yarn.id,
        // status & created_at use defaults
      }
    })
  }
  console.log(`  • Seeded ${yarnListingsData.length} yarn listings`)

  // 3) Seed Notions + Listing
  const notionListingsData = [
    {
      pictures:    ['https://example.com/notion1.jpg'],
      name:        'Circular Needles',
      quantity:    1,
      quality:     'new',
      type:        'donate',
      price:       12.0,
      location:    'Chicago, IL',
      description: 'Size 8, 32 inch circular needles',
    },
    {
      pictures:    ['https://example.com/notion2.jpg'],
      name:        'Stitch Markers',
      quantity:    10,
      quality:     'good',
      type:        'donate',
      price:       0.0,
      location:    'New York, NY',
      description: 'Assorted colors',
    },
  ]

  for (const n of notionListingsData) {
    const owner = randomUser()
    const notion = await prisma.notion.create({
      data: {
        ...n,
        user: { connect: { id: owner.id } }
      }
    })

    await prisma.listing.create({
      data: {
        seller:       { connect: { id: owner.id } },
        listing_type: 'notion',
        product_id:   notion.id,
      }
    })
  }
  console.log(`  • Seeded ${notionListingsData.length} notion listings`)

  // 4) Seed FinishedObjects + Listing
  const finishedObjectData = [
    {
      pictures:    ['https://example.com/finished1.jpg'],
      name:        'Hand-knit Scarf',
      size:        'Adult',
      quality:     'new',
      type:        'sell',
      price:       45.0,
      location:    'Los Angeles, CA',
      description: 'Warm wool scarf in herringbone pattern',
    },
    {
      pictures:    ['https://example.com/finished2.jpg'],
      name:        'Crochet Blanket',
      size:        'Baby',
      quality:     'good',
      type:        'swap',
      price:       30.0,
      location:    'Chicago, IL',
      description: 'Soft baby blanket in pastel colors',
    },
  ]

  for (const f of finishedObjectData) {
    const owner = randomUser()
    const obj = await prisma.finishedObject.create({
      data: {
        ...f,
        user: { connect: { id: owner.id } }
      }
    })

    await prisma.listing.create({
      data: {
        seller:       { connect: { id: owner.id } },
        listing_type: 'finished_object',
        product_id:   obj.id,
      }
    })
  }
  console.log(`  • Seeded ${finishedObjectData.length} finished-object listings`)

  console.log('✅  Database successfully seeded.')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
