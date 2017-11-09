import * as commandLineArgs from 'command-line-args'

const optionDefinitions: commandLineArgs.OptionDefinition[] = [
    { name: 'src', defaultOption: true, multiple: true }
];

console.log(commandLineArgs(optionDefinitions))
