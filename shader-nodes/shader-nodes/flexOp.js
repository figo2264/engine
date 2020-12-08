// node
var flexOp = {
    // placeholder meta data - structure will be finalized in MVP S3
    meta: {
        ports: [
            { id: 0 },
            { id: 1 },
            { id: 2 },
            { id: 3 },
            { id: 4 },
            { id: 5 },
            { id: 6 }
        ]
    },
    // placeholder editor data - structure will be finalized in MVP S3
    editor: {
        label: "FLEXIBLE OPERATOR",
        ports: [
            { label: '' },
            { label: 'A' },
            { label: 'B' },
            { label: 'C' },
            { label: 'D' },
            { label: 'E' },
            { label: 'F' }
        ]
    }
};

// utility
export var type2Comp = { float: 1, vec2: 2, vec3: 3, vec4: 4 };
export var comp2Type = ['', 'float', 'vec2', 'vec3', 'vec4'];

flexOp.getRetType = function ( argTypes ) {
    var maxComp = 0;
    for (var argIndex = 0; argIndex < argTypes.length; argIndex++) {
        maxComp = Math.max(maxComp, type2Comp[argTypes[argIndex]]);
    }
    return comp2Type[maxComp];
};

flexOp.getHeadCode = function (retType, opName, argTypes, outputRetComponents ) {
    var code = retType + ' ' + opName + '( ';
    for (var argIndex = 0; argIndex < argTypes.length; argIndex++) {
        code += 'in ' + argTypes[argIndex] + ' arg' + argIndex;

        code += (argIndex === argTypes.length - 1) ? ' )\n' : ', ';
    }
    if (outputRetComponents && type2Comp[retType] === 4) {
        code.replace(' )\n', ', out vec3 rgb, out float r, out float g, out float b, out float a )\n');
    }

    return code;
};

// generator
flexOp.gen = function ( argTypes, options ) {
    var opName = options.opName;
    var opCode = options.opCode;

    // determine return type
    var retType = this.getRetType(argTypes);

    // construct head code
    var code = this.getHeadCode(retType, opName, argTypes);

    // precision - alter name to create variant
    if (options && options.precision) {
        code = code.replace(' ' + opName, ' ' + opName + '_' + options.precision);
    }

    // construct body code
    code += '{\n';

    // precision - tmp: useful comment
    code += ((options && options.precision) ? '// precision ' + options.precision + ' float;\n' : '');

    code += '    return ';

    for (var argIndex = 0; argIndex < argTypes.length; argIndex++) {
        // convert all arguments to return type
        code += retType + '(arg' + argIndex;

        // expand if needed - extra components are set to zero - NB scalar values are broadcast to all components
        var argComp = type2Comp[argTypes[argIndex]];
        var extend = type2Comp[retType] - argComp;
        code += (extend > 0 && argComp !== 1) ? ', ' + comp2Type[expand] + '(0))' : ')';

        code += (argIndex === argTypes.length - 1) ? ';\n' : ' ' + opCode + ' ';
    }

    code += '}\n';

    return code;
};

export { flexOp };
export default flexOp;
