const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');
// const Review = require('./reviewModel');
//const validator = require('validator');

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'A product must have a name.'],
      unique: true,
      trim: true
    },
    generalInformation: {
      name: {
        type: String,
        required: [true, 'A product must have a name.'],
        unique: true,
        trim: true
      },
      orderCode: {
        type: String,
        required: [true, 'A product must have a order code.'],
        unique: true,
        trim: true
      },
      ean: { type: String },
      catalogDescription: {
        type: String,
        trim: true,
        required: [true, 'A product must have a short description.']
      },
      longDescription: {
        type: String,
        trim: true,
        required: [true, 'A product must have a long description.']
      },
      vnDescription: {
        type: String,
        trim: true
      },
      minimumOrderQuantity: { type: Number },
      unit: { type: String },
      unit_vn: { type: String },
      co: { type: String },
      productOrigin: {
        type: String,
        required: [true, 'A product must have a place of manufacture.']
      },
      productBrand: {
        type: String,
        required: [true, 'A product must have a brand!']
      }
    },
    slug: String,

    imageUrl: {
      type: [String],
      required: [true, 'A product must have a cover image.']
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },

    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          // this only points to current doc on NEW document creation.
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price'
      }
    },
    price: { type: Object },

    inventory: {
      exist: {
        type: Number,
        default: 0
      },
      preOrdered: {
        type: Number,
        default: 0
      },
      po: {
        type: Number,
        default: 0
      },
      lastUpdated: Date
    },

    dimensions: {
      netLength: { type: Number },
      netHeight: { type: Number },
      netWidth: { type: Number },
      netWeight: { type: Number }
    },

    //Technical
    technical: {
      standards: { type: String },
      numberOfPoles: { type: Number },
      numberOfProtectPoles: { type: Number },
      triCha: { type: String },
      ratedCurrent: { type: Number },
      ratOpeVol: { type: String },
      ratSerShoCirBreCap: { type: String },
      ratUltShoCirBreCap: { type: String },
      ratInsShoCirCurSet: { type: String },
      ratOpePowAc3: { type: String },
      ratOpeVol: { type: String },
      ratOpeCur: { type: Number },
      ratOpeCurAc3: { type: Number },
      ratOpeCurDc5: { type: Number },
      settingRange: { type: String },
      powerLoss: { type: String },
      rateInsVol: { type: String },
      operationalVoltage: { type: String },
      ratedFrequency: { type: String },
      ratShoCirCap: { type: String },
      energyLimitingClass: {
        type: Number,
        enum: [1, 2, 3]
      },
      overvoltageCategory: {
        type: String,
        enum: ['I', 'II', 'III', 'IV', 'V']
      },
      pollutionDegree: { type: Number },
      ratImpWitVol: { type: String },
      dieTesVol: { type: String },
      houseMaterial: { type: String },
      typeOpeHea: { type: String },
      actuatorMaterial: { type: String },
      conPosInd: { type: String },
      conFreAirTheCur: { type: String },
      degreeOfProtection: { type: String },
      remarks: { type: String },
      wirStrLen: { type: String },
      electricalEndurance: { type: String },
      mechanicalEndurance: { type: Number },
      termType: { type: String },
      screwTermType: { type: String },
      connectingCapacity: { type: String },
      tighteningTorque: { type: String },
      recScrDri: { type: String },
      mountingOnDinRail: { type: String },
      mountingPosition: { type: String },
      minMouDis: { type: String },
      builtinDepth: { type: Number },
      installationSize: { type: String },
      powSupCon: { type: String }
    },
    //Environmental
    environmental: {
      ambAirTem: { type: String },
      refAmbAirTem: { type: String },
      reToShAcToIe60068227: { type: String },
      resVib: { type: String },
      envCon: { type: String },
      roHSStatus: {}
    },

    //customize
    originalLink: {
      type: String,
      required: [true, 'A product must have link detail.']
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    secretProduct: {
      type: Boolean,
      default: false
    },

    sales: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// productSchema.index({ price: 1 });
productSchema.index({ price: 1, ratingsAverage: -1 });
productSchema.index({ slug: 1 });
productSchema.index({ startLocation: '2dsphere' });

// productSchema.virtual('durationWeeks').get(function () {
//   return this.duration / 7;
// });

// Virtual populate
productSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'product',
  localField: '_id'
});

//DOCUMENT MIDDLEWARE: run before .save() and .creat()
productSchema.pre('save', function(next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});

// productSchema.pre('save', async function(next) {
//   const guidesPromises = this.guides.map(async id => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// productSchema.pre('save', function(next) {
//   console.log('Will save document...');
//   next();
// });

// productSchema.post('save', function(doc, next) {
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE
// được trigger khi  bất kỳ command nào bắt đầu với find được hook tới, xử lý middware này trước r tiếp tục
productSchema.pre(/^find/, function(next) {
  this.find({ secretProduct: { $ne: true } }); // tiền xử lý find* command

  this.start = Date.now();
  next();
});

productSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });
  next();
});

productSchema.post(/^find/, function(docs, next) {
  console.log(`Product query took ${Date.now() - this.start} milliseconds.`);

  next();
});

// AGGREGATION MIDDLEWARE
// productSchema.pre('aggregate', function(next) {
//   this.pipeline().unshift({ $match: { secretProduct: { $ne: true } } });

//   next();
// });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
