import { cac } from "cac";
import { registerDataCommand } from "./commands/data.js";
import { registerDoctorCommand } from "./commands/doctor.js";

const cli = cac("dota");

registerDataCommand(cli);
registerDoctorCommand(cli);

cli.help();
cli.version("1.0.0");

cli.parse();
