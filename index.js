#!/usr/bin/env node

import { program } from "commander";
import path from "path";
import gs from "ghostscript-node";
import fs from "fs-extra";

program
  .command("compress")
  .alias("cp")
  .argument("[file]", "PDF file for compress")
  .description("Compress pdf file")
  .action(async function (file) {
    try {
      console.log("Processing...");

      const pdf = fs.readFileSync(file);
      const output = addStringToFilename(file, "compressed");
      const compressed = await gs.compressPDF(pdf);

      fs.appendFileSync(output, Buffer.from(compressed));

      console.log("Complete!");
    } catch (error) {
      console.error(error.message);
    }
  });

program
  .command("split")
  .alias("s")
  .argument("[file]", "PDF file for split")
  .argument("[start]", "Start page", 0)
  .argument("[last]", "Last page")
  .description("Split pdf file")
  .action(async function (file, start, last) {
    try {
      console.log("Processing...");

      const pdf = fs.readFileSync(file);
      const lastPage = last == null ? await gs.countPDFPages(pdf) : last;
      const output = addStringToFilename(file, start + "-" + lastPage);
      const extract = await gs.extractPDFPages(pdf, start, lastPage);

      fs.appendFileSync(output, Buffer.from(extract));

      console.log("Complete!");
    } catch (error) {
      console.error(error.message);
    }
  });

program
  .command("combine")
  .alias("cb")
  .argument("[file1]", "First PDF file for combine")
  .argument("[file2]", "Second PDF file for combine")
  .description("Combine pdf file")
  .action(async function (file1, file2) {
    console.log("Processing...");

    try {
      const pdf1 = fs.readFileSync(file1);
      const pdf2 = fs.readFileSync(file2);
      const output = addStringToFilename(file1, "combine");

      const combine = await gs.combinePDFs([pdf1, pdf2]);

      fs.appendFileSync(output, Buffer.from(combine));

      console.log("Complete!");
    } catch (error) {
      console.error(error.message);
    }
  });

program.parse(process.argv);

if (program.args.length === 0) {
  program.help();
}

function addStringToFilename(filename, addedString) {
  const ext = path.extname(filename);
  const basename = path.basename(filename, ext);

  return `${basename}_${addedString}${ext}`;
}