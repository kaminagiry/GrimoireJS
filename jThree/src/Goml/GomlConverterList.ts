import GomlNodeListElement = require("./GomlNodeListElement");

declare function require(string):any ;

var converterList={
  "angle":require('./Converter/AngleAttributeConverter'),
  "number":require('./Converter/NumberAttributeConverter')
};
export=converterList;
