/* @flow */

import { parse } from './parser/index'
import { optimize } from './optimizer'
import { generate } from './codegen/index'
import { createCompilerCreator } from './create-compiler'

// `createCompilerCreator` allows creating compilers that use alternative
// parser/optimizer/codegen, e.g the SSR optimizing compiler.
// Here we just export a default compiler using the default parts.
export const createCompiler = createCompilerCreator(function baseCompile (
  template: string,
  options: CompilerOptions
): CompiledResult {
  const ast = parse(template.trim(), options)
  if (options.optimize !== false) {
    optimize(ast, options)
  }
  const code = generate(ast, options)
  console.log('%ctemplate:','color: yellow; font-style: italic; background-color: blue;padding: 2px;font-size:2em')
  console.log(`${template.trim()}`)
  console.log("%c==========================================",'color: yellow; font-style: italic; background-color: blue;padding: 2px;font-size:2em')
  console.log('%crender函数:','color: white; font-style: italic; background-color: black;padding: 2px;font-size:2em')
  console.log(`${code.render}`)
  console.log("%c==========================================",'color: white; font-style: italic; background-color: black;padding: 2px;font-size:2em')
  return {
    ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  }
})
