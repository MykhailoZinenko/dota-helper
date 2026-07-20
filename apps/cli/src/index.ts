import { cac } from "cac";

const cli = cac("dota");

cli.help();
cli.version("1.0.0");

cli.parse();
