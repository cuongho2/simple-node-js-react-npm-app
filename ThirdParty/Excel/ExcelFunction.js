"use strict";

// Require library
var excel = require("excel4node");

const cellA = 1;

async function importToSheet(WorkBook, sheetName = 'sheet1', jsonArray) {
  // Create a reusable style
  var CellStyle = WorkBook.createStyle({
    font: {
      color: "#000000",
      size: 12
    }
  });

  // Create a reusable style
  var HeaderStyle = WorkBook.createStyle({
    font: {
      color: "#FF0000",
      size: 14,
      bold: true
    }
  });

  var worksheet = WorkBook.addWorksheet(sheetName);
  let headerColumns = Object.keys(jsonArray[0]);

  console.log("Let's make report for this 'sheet' :) " + sheetName);
  console.log("headerColumns: " + headerColumns);

  for (var i = 0; i < headerColumns.length; i++) {
    worksheet
      .cell(1, cellA + i)
      .string(headerColumns[i])
      .style(HeaderStyle);
  }

  for (var i = 0; i < jsonArray.length; i++) {
    let rowData = jsonArray[i];
    for (var j = 0; j < Object.keys(rowData).length; j++) {
      let key = Object.keys(rowData)[j];
      let value = rowData[key];
      if (value === undefined || value === null) {
        value = '';
      } else {
        value = rowData[key].toString()
      }
      worksheet
        .cell(2 + i, cellA + j)
        .string(value)
        .style(CellStyle);
    }
  }
}

async function renderExcelFile(fileName, data, sheetName) {
  const fullPath = 'downloads/' + fileName + '.xlsx';
  // Create a new instance of a Workbook class
  var WorkBook = new excel.Workbook();

  await importToSheet(WorkBook, sheetName, data);
  WorkBook.write(fullPath);
  return fileName + '.xlsx';
}

module.exports = {
  renderExcelFile
};
