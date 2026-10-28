import { selected } from "archify-resolution-probe";
console.log(JSON.stringify({selected, resolved:import.meta.resolve("archify-resolution-probe")}));
