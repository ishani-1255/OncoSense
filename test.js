const predict = require('./index.js');

const imageUrl = "https://res.cloudinary.com/dddy0oub8/image/upload/v1730010862/Cancer_Detection/wttorkxmdmdhevf2fkoj.jpg"

// Example usage
predict(imageUrl)
  .then(result => {
    console.log('Prediction:', result);
    console.log(typeof(result))
  })
  .catch(error => {
    console.error('Error:', error.message);
  });