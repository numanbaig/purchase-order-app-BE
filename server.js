const express = require('express')
const app = express()
const bodyparser = require('body-parser')
const multer = require('multer')
const path = require('path')

const fs = require("fs");
const fastCsv = require("fast-csv");
const { addDoc, collection } = require('firebase/firestore')
const { db } = require('./firebase.config')


//use express static folder
app.use(express.static("./public"))

// body-parser middleware use
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({
    extended: true
}))


//! Use of Multer
var storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './uploads/')    
    },
    filename: (req, file, callBack) => {
        callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})

var upload = multer({
    storage: storage
});

const options = {
  objectMode: true,
  delimiter: ";",
  quote: null,
  headers: true,
  renameHeaders: false,
};

const data = [];

// upload csv to database
app.post('/uploadfile', upload.single("file"), (req, res, next) =>{
  try {
    const orderDate = new Date(req.body.date);
    const vendorName = req.body.vendorName;
    function dateIsValid(date) {
      return date instanceof Date && !isNaN(date);
    }

    if (!dateIsValid(orderDate)) { 
      throw 'Date is Missing or invalid'
    }

    if (!vendorName) { 
      throw 'Vendor Name is Missing'
    }

    if(req.file) {
      fs.createReadStream(req.file.path)
      .pipe(fastCsv.parse(options))
      .on("error", (error) => {
        throw error
      })
      .on("data", (row) => {
        const order = {
          modelNumber: row['Model Number,Unit Price,Quantity'].split(",")[0],
          unitPrice: Number(row['Model Number,Unit Price,Quantity'].split(",")[1]),
          quantity: Number(row['Model Number,Unit Price,Quantity'].split(",")[2])
        }
        data.push(order)
      })
      .on("end", async (rowCount) => {
        try {
          let errors = [];
          data.forEach((order) => {
            if (isNaN(order.quantity)) {
              errors.push(`Quantity should be Number`)
            }

            if (isNaN(order.unitPrice)) {
              errors.push(`Unit Price should be decimal Number `)
            }

            if(!order.modelNumber) {
              errors.push(`Model Number should be String `)
            }
          })
  
          if(errors.length > 0) {
            throw errors
          }

          // await addDoc(doc(db, "purchaseOrder"),{data})

          console.log('data', data)
          await addDoc(collection(db, "purchaseOrder"), { data: data, vendorName, orderDate});

          res.send('Uploaded Successfully')
        } catch (err) {
          console.log('err', err)
          res.status(400).json({ message: err})
        }
        
      });
    } else {
      throw 'File is Missing'
    }
  } catch (err) {
    console.log('err 2', err)
    res.status(400).json({ message: err})
  }

  


  
});

//create connection
const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server is running at port ${PORT}`))
