// Authored teaching fixture; mode names are strings, not an Archify schema.
#Reader: {
    mode: *"overview" | string
}

preferred: *"detail" | string

viaReference: #Reader & {
    mode: preferred
}

viaInterpolation: #Reader & {
    mode: "\(preferred)"
}

explicitValue: viaReference & {
    mode: "audit"
}

reversedOperands: {
    mode: preferred
} & #Reader
