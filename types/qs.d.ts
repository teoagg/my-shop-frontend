declare module 'qs' {
  type StringifyOptions = {
    encodeValuesOnly?: boolean
  }

  const qs: {
    stringify(value: unknown, options?: StringifyOptions): string
  }

  export default qs
}
