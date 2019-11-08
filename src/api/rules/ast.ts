import { Literal, Rule, ParseResult, SomeVariable, Variable, SetVariable } from './types'
import { SqidRuleSchema } from '@/api/types'
import Ajv from 'ajv'

type visitor<T> = (node: ParseResult, children?: T[]) => T[]

function walk<T>(ast: ParseResult | ParseResult[], visit: visitor<T>): T[] {
  if (ast instanceof Array) {
    return ast.flatMap((node) => walk(node, visit))
  }

  switch (ast.type) {
      // leaf nodes
    case 'some-variable':
    case 'variable':
    case 'literal':
    case 'literal-expression':
    case 'set-variable':
    case 'star':
    case 'plus':
    case 'dot':
      return visit(ast)

    case 'set-term':
    case 'closed-specifier':
    case 'open-specifier':
      return visit(ast, walk(ast.assignments, visit))

    case 'assignment':
      const attribute = walk(ast.attribute, visit)
      const value = walk(ast.value, visit)
      return visit(ast, [attribute, value].flat())

    case 'function-term':
      return visit(ast, walk(ast.arguments, visit))

    case 'relational-atom':
      const predicate = walk(ast.predicate, visit)
      const args = walk(ast.arguments, visit)
      const annotation = walk(ast.annotation, visit)
      return visit(ast, [predicate, args, annotation].flat())

    case 'set-atom':
    case 'specifier-atom':
      const set = walk(ast.set, visit)
      const specifier = walk(ast.specifier, visit)
      return visit(ast, [set, specifier].flat())

    case 'union':
    case 'intersection':
    case 'difference':
      return visit(ast, walk(ast.specifiers, visit))

    case 'rule':
      const body = walk(ast.body, visit)
      const head = walk(ast.head, visit)
      return visit(ast, [body, head].flat())

    default:
      const _: never = ast
      return _
  }
}

function collectVariables(ast: ParseResult,
                          children?: Array<SomeVariable | Variable | SetVariable>) {
  switch (ast.type) {
    case 'some-variable':
    case 'variable':
    case 'set-variable':
      return [ast]

    default:
      return children || []
  }
}

function collectLiterals(ast: ParseResult, children?: Literal[]) {
  switch (ast.type) {
    case 'literal':
      return [ast]

    default:
      return children || []
  }
}

function collectStrings(ast: ParseResult, children?: string[]) {
  switch (ast.type) {
    case 'some-variable':
    case 'variable':
    case 'literal':
    case 'set-variable':
      return [ast.name]

    case 'literal-expression':
      return [`"${ast.name}"`]

    case 'star':
      return ['*']

    case 'plus':
      return ['+']

    case 'dot':
      const [fromSpecifier, item] = children || []
      return [`${fromSpecifier}.${item}`]

    case 'set-term':
      if (children === undefined) {
        return ['{}']
      }
      return [`{${children.join(', ')}}`]

    case 'closed-specifier':
      if (children === undefined) {
        return ['[]']
      }
      return [`[${children.join(', ')}]`]

    case 'open-specifier':
      if (children === undefined) {
        return ['()']
      }
      return [`(${children.join(', ')})`]

    case 'assignment':
      const [attribute, value] = children || []
      return [`${attribute} = ${value}`]

    case 'function-term':
      if (children === undefined) {
        return [`${ast.name}()`]
      }
      return [`${ast.name}(${children.join(', ')})`]

    case 'relational-atom': {
      const [predicate, left, right, annotation] = children || []
      const maybeAnnotation = ((annotation.length > 0) ? `@${annotation}` : '')
      return [`(${left}.${predicate} = ${right})${maybeAnnotation}`]
    }

    case 'set-atom':
    case 'specifier-atom':
      const [set, specifier] = children || []
      return [`${set}:${specifier}`]

    case 'union': {
      const [left, right] = children || []
      return [`(${left} || ${right})`]
    }

    case 'intersection': {
      const [left, right] = children || []
      return [`(${left} && ${right})`]
    }

    case 'difference': {
      const [left, right] = children || []
      return [`(${left} \\ ${right})`]
    }

    case 'rule':
      const [head, ...body] = (children || []).reverse()
      return [`${body.reverse().join(', ')} -> ${head}`]

    default:
      const _: never = ast
      return _
  }
}

type Named = SomeVariable | Variable | SetVariable | Literal

function isSame(left: Named, right: Named) {
  return left.type === right.type && left.name === right.name
}

function deduplicate(args: Named[]) {
  return args.reduce((uniques, elt) => {
    if (uniques.find((unique) => isSame(unique, elt))) {
      return uniques
    }

    return [...uniques, elt]
  }, [] as Named[])
}

export function variables(ast: ParseResult | ParseResult[]) {
  return deduplicate(walk(ast, collectVariables))
}

export function literals(ast: ParseResult | ParseResult[]) {
  return deduplicate(walk(ast, collectLiterals))
}

export function print(ast: ParseResult | ParseResult[]) {
  return walk(ast, collectStrings).join('')
}

export function verify(schema: SqidRuleSchema, rule: Rule) {
  const validator = new Ajv()
  const valid = validator.validate(schema, rule)

  if (!valid) {
    throw new SyntaxError(`Failed to validate rule AST: ${validator.errors}`)
  }

  // ensure rule safety
  const variablesInHead = variables(rule.head)
  const variablesInBody = variables(rule.body)

  vars: for (const variable of variablesInHead) {
    for (const other of variablesInBody) {
      if (variable.name === other.name) {
        if (variable.type !== other.type) {
          throw new SyntaxError(`Variable ${variable} occurs with different types`)
        }

        continue vars
      }
    }

    throw new SyntaxError(`Variable ${variable} does not occur in the rule body`)
  }
}
