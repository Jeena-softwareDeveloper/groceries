const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

// 1. Change provider
schema = schema.replace('provider = "postgresql"', 'provider = "sqlite"');

// 2. Remove enums block entirely
schema = schema.replace(/enum \w+ {[^}]*}/g, '');

// 3. Replace @db.Decimal and @db.Text
schema = schema.replace(/@db\.Decimal\(\d+,\s*\d+\)/g, '');
schema = schema.replace(/@db\.Text/g, '');

// 4. Fix specific array
schema = schema.replace(/tags\s+ProductTag\[\]/g, 'tags String?');

// 5. Update enum usages in models to String
const enums = [
  'VendorStatus', 'ProductTag', 'ProductStatus', 'OrderStatus',
  'PaymentStatus', 'PaymentMethod', 'OfferScope', 'CouponScope',
  'NotificationType', 'WalletTxnType', 'TicketStatus'
];

enums.forEach(e => {
  const regex = new RegExp(`(\\w+)\\s+${e}(\\?)?(\\s+@default\\(([^)]+)\\))?`, 'g');
  schema = schema.replace(regex, (match, field, optional, defaultBlock, defaultVal) => {
    let res = `${field} String`;
    if (optional) res += '?';
    if (defaultBlock) res += ` @default("${defaultVal}")`;
    return res;
  });
});

fs.writeFileSync(schemaPath, schema);
console.log('Schema converted to SQLite');
