import P from 'parsimmon'
import { MARPL, Annotation, Argument, Assignment, Assignments, Atom, Dot,
         FunctionTerm, ObjectTerm, ParseResult, Placeholder, RelationalAtom,
         Rule, SetTerm, SetVariable, SimpleNamed, Specifier, SpecifierAtom, SpecifierTerm,
         SpecifierType, SpecifierExpressionType, isSetVariable, isSomeVariable, LiteralExpression,
         isRelationalAtom, isSetAtom, isClosedSpecifier, isSpecifier, isSpecifierAtom } from './types'
import { verify } from './ast'

type Language = P.TypedLanguage<MARPL>

function word(w: string) {
  return P.string(w).trim(P.regexp(/\s*/m))
}

function assignment(r: Language, rhs: P.Parser<ObjectTerm | Dot | Placeholder>) {
  return P.seqObj<Assignment>(['attribute', r.ObjectTerm],
                              r.equals,
                              ['value', rhs],
                             ).thru(type('assignment'))
}

function specifierType(typeName: SpecifierType): 'open-specifier' | 'closed-specifier' {
  // be a bit verbose to satisfy the type checker
  if (typeName === 'open') {
    return 'open-specifier'
  }

  return 'closed-specifier'
}

function specifier(r: Language,
                   opening: P.Parser<string>, closing: P.Parser<string>,
                   typeName: SpecifierType): P.Parser<Specifier> {
  return P.seqObj<Assignments>(opening,
                               ['assignments',
                                P.sepBy<Assignment, string>(
                                  r.AssignmentWithPlaceholder,
                                  r.comma)],
                               closing).thru(type(specifierType(typeName)))
}

function specifierExpression(r: Language, typeName: SpecifierExpressionType) {
  return P.seqObj<{ lhs: SpecifierTerm,
                    rhs: SpecifierTerm,
                  }>(r.openingParenthesis,
                     ['lhs', r.SpecifierTerm],
                     r[typeName],
                     ['rhs', r.SpecifierTerm],
                     r.closingParenthesis,
                    ).map((obj) => {
                      return {
                        type: typeName,
                        specifiers: [obj.lhs, obj.rhs],
                      }
                    })
}

function relationalAtom(r: Language, setTerm: P.Parser<Annotation>): P.Parser<RelationalAtom> {
  return P.seqObj<{ subject: ObjectTerm,
                    predicate: ObjectTerm,
                    object: ObjectTerm,
                    annotation: Annotation,
                  }>(r.openingParenthesis,
                     ['subject', r.ObjectTerm],
                     r.dot,
                     ['predicate', r.ObjectTerm],
                     r.equals,
                     ['object', r.ObjectTerm],
                     r.closingParenthesis,
                     r.at,
                     ['annotation', setTerm],
                    ).map((obj) => {
                      return {
                        type: 'relational-atom',
                        predicate: obj.predicate,
                        arguments: [obj.subject, obj.object],
                        annotation: obj.annotation,
                      }
                    })
}

function type<T extends ParseResult, U extends T>(typeName: U['type']): (parser: P.Parser<T>) => P.Parser<U> {
  return (parser) => {
    return (parser as P.Parser<U>).map((obj) => {
      obj.type = typeName
      return obj
    })
  }
}

const MARPL = P.createLanguage<MARPL>({
  at: () => word('@'),
  dot: () => word('.'),
  comma: () => word(','),
  colon: () => word(':'),
  arrow: () => word('->'),
  union: () => word('||'),
  equals: () => word('='),
  difference: () => word('\\'),
  intersection: () => word('&&'),
  objectName: () => P.regexp(/[PQ]\d+/),
  literalExpression: () => P.regexp(/"[^"]*"/),
  variableName: () => P.regexp(/\?[a-zA-Z]\w*/),
  openingBrace: () => word('{'),
  closingBrace: () => word('}'),
  openingFloor: () => word('('),
  closingFloor: () => word(')'),
  openingBracket: () => word('['),
  closingBracket: () => word(']'),
  openingParenthesis: () => word('('),
  closingParenthesis: () => word(')'),
  someVariable: (r: Language) => {
    return P.seqObj<SimpleNamed>(['name', r.variableName])
      .desc('a variable')
      .thru(type('some-variable'))
  },
  ObjectVariable: (r: Language) => {
    return P.seqObj<SimpleNamed>(['name', r.variableName])
      .desc('an object variable')
      .thru(type('variable'))
  },
  ObjectLiteral: (r: Language) => {
    return P.seqObj<SimpleNamed>(['name', r.objectName])
      .desc('an object literal')
      .thru(type('literal'))
  },
  LiteralExpression: (r: Language) => {
    return P.seqObj<SimpleNamed>(['name', r.literalExpression])
      .desc('a quoted literal expression')
      .thru(type('literal-expression'))
  },
  ObjectTerm: (r: Language) => {
    return P.alt(
      r.ObjectVariable,
      r.ObjectLiteral,
    )
  },
  ObjectTermOrLiteral: (r: Language) => {
    return P.alt(
      r.literalExpression,
      r.ObjectTerm,
    )
  },
  SetLiteral: (r: Language) => {
    return P.seqObj<Assignments>(r.openingBrace,
                                 ['assignments', P.sepBy(r.Assignment, r.comma)],
                                 r.closingBrace,
                                )
      .thru(type('set-term'))
  },
  SetVariable: (r: Language) => {
    return P.seqObj<SimpleNamed>(['name', r.variableName])
      .desc('a set variable')
      .thru(type('set-variable'))
  },
  SetTerm: (r: Language) => {
    return P.alt(
      r.SetLiteral,
      r.SetVariable,
      specifier(r, r.openingFloor, r.closingFloor, 'open'),
      specifier(r, r.openingBracket, r.closingBracket, 'closed'),
    )
  },
  DottedSetTerm: (r: Language) => {
    return P.alt(
      P.seqObj<Assignments>(r.openingBrace,
               ['assignments', P.sepBy(r.DottedAssignment, r.comma)],
               r.closingBrace,
              ).thru(type('set-term')),
      P.seqObj<Assignments>(r.openingBracket,
               ['assignments', P.sepBy(r.DottedAssignment, r.comma)],
               r.closingBracket,
              ).thru(type('closed-specifier')),
    )
  },
  FunctionTerm: (r: Language) => {
    return P.seqObj<FunctionTerm>(['name', P.regexp(/[a-zA-Z]\w*/)],
                    r.openingParenthesis,
                    ['arguments',
                     P.sepBy<Argument,
                     string>(P.alt(r.ObjectLiteral,
                                   r.SetLiteral,
                                   r.someVariable),
                             r.comma)],
                    r.closingParenthesis,
                   ).thru(type('function-term'))
  },
  RelationalAtom: (r: Language) => {
    return relationalAtom(r, r.SetTerm)
  },
  RelationalAtomWithFunctionTerm: (r: Language) => {
    return relationalAtom(r, r.FunctionTerm)
  },
  RelationalAtomWithDots: (r: Language) => {
    return relationalAtom(r, r.DottedSetTerm)
  },
  SimpleRelationalAtom: (r: Language) => {
    return P.seqObj<{ subject: ObjectTerm,
                      predicate: ObjectTerm,
                      object: ObjectTerm | LiteralExpression,
                    }>(r.openingParenthesis,
                       ['subject', r.ObjectTerm],
                       r.dot,
                       ['predicate', r.ObjectTerm],
                       r.equals,
                       ['object', r.ObjectTermOrLiteral],
                       r.closingParenthesis,
                      ).map((obj) => {
                        return {
                          type: 'relational-atom',
                          predicate: obj.predicate,
                          arguments: [obj.subject, obj.object],
                          annotation: {
                            type: 'closed-specifier',
                            assignments: [],
                          },
                        }
                      })
  },
  Dot: (r: Language) => {
    return P.seqObj<Dot>(['fromSpecifier', r.SetVariable],
                         r.dot,
                         ['item', r.ObjectLiteral],
                        ).thru(type('dot'))
  },
  Placeholder: () => {
    return P.alt(
      word('*').map(() => {
        return {
          type: 'star' as const,
        }
      }),
      word('+').map(() => {
        return {
          type: 'plus' as const,
        }
      })).desc('a placeholder')
  },
  Assignment: (r: Language) => {
    return assignment(r, r.ObjectTerm)
  },
  AssignmentWithPlaceholder: (r: Language) => {
    return assignment(r, P.alt(
      r.ObjectTerm,
      r.Placeholder,
    ))
  },
  DottedAssignment: (r: Language) => {
    return assignment(r, P.alt(
      r.Dot,
      r.ObjectTerm,
      r.Placeholder,
    ))
  },
  Specifier: (r: Language) => {
    return P.alt(
      specifier(r, r.openingFloor, r.closingFloor, 'open'),
      specifier(r, r.openingBracket, r.closingBracket, 'closed'),
    )
  },
  SpecifierExpression: (r: Language) => {
    return P.alt(
      specifierExpression(r, 'union'),
      specifierExpression(r, 'intersection'),
      specifierExpression(r, 'difference'),
    )
  },
  SpecifierTerm: (r: Language) => {
    return P.alt(r.SpecifierExpression,
                 r.Specifier)
  },
  SpecifierAtom: (r: Language) => {
    return P.seqObj<SpecifierAtom>(['set', r.SetVariable],
                    r.colon,
                    ['specifier', r.SpecifierTerm])
      .thru(type('specifier-atom'))
  },
  Rule: (r: Language) => {
    return P.seqObj<Rule>(['body', r.Body],
                    r.arrow,
                    ['head', r.Head])
      .thru(type('rule'))
  },
  Head: (r: Language) => {
    return P.alt(
      r.RelationalAtomWithDots,
      r.RelationalAtom,
      r.SimpleRelationalAtom,
      r.RelationalAtomWithFunctionTerm,
    )
  },
  Body: (r: Language) => {
    return P.sepBy<RelationalAtom, string>(
      P.alt(
        r.RelationalAtom,
        r.SimpleRelationalAtom,
        r.SpecifierAtom),
      r.comma)
  },
})

export function parseRule(rule: string, schema?: object) {
  const parsed = Object.freeze(rewrite(MARPL.Rule.tryParse(rule)))

  if (schema) {
    verify(schema, parsed)
  }

  return parsed
}

function rewrite(ast: Rule) {
  if (ast.head.annotation.type === 'function-term') {
    // disambiguate variable names in the function term
    arguments: for (const [arg, argument] of ast.head.annotation.arguments.entries()) {
      if (isSomeVariable(argument)) {
        // find a binding for this variable in the body
        const name = argument.name

        for (const atom of ast.body) {
          if (isRelationalAtom(atom)) {
            const annotation = atom.annotation
            if (isSetVariable(annotation) &&
                annotation.name === name) {
              ast.head.annotation.arguments[arg].type = 'set-variable'
              continue arguments
            }

            if (atom.predicate.type === 'variable' &&
                atom.predicate.name === name) {
              ast.head.annotation.arguments[arg].type = 'variable'
              continue arguments
            }

            for (const property of atom.arguments) {
              if (property.type === 'variable' &&
                  property.name === name) {
                ast.head.annotation.arguments[arg].type = 'variable'
                continue arguments
              }
            }
          } else if (isSetAtom(atom)) {
            if (atom.set.name === name) {
              ast.head.annotation.arguments[arg].type = 'set-variable'
              continue arguments
            }
          } else if (isSpecifierAtom(atom)) {
            if (atom.set.name === name) {
              ast.head.annotation.arguments[arg].type = 'set-variable'
            }

            if (isSpecifier(atom.specifier)) {
              for (const assign of atom.specifier.assignments) {
                if (assign.attribute.name === name ||
                  ('name' in assign.value && assign.value.name === name)) {
                  ast.head.annotation.arguments[arg].type = 'variable'
                  continue arguments
                }
              }
            }
          }
        }
      }

      if (isSomeVariable(argument)) {
        // this variable does not occour within the body, as is required
        throw new SyntaxError(`Variable \`${name} is unbound in rule: ${ast}`)
      }
    }
  }

  if (isClosedSpecifier(ast.head.annotation)) {
    // just treat it as a set literal
    ((ast.head.annotation as unknown) as SetTerm).type = 'set-term'
  }

  const atoms: Atom[] = ast.body

  // push specifiers into specifier atoms
  for (const [idx, atom] of ast.body.entries()) {
    if (isRelationalAtom(atom) && isSpecifier(atom.annotation)) {
      const variable = { type: 'set-variable',
                         name: `?_body_spec_for_${atom}`,
                       } as const

      atoms.push(specifierAtom(variable, atom.annotation))
      {
        // this needs to be a new block so that the following line
        // doesn't turn the previous expression into a function call,
        // which would result in a type error, since Array.push
        // returns a Number, and those are not callable.
        (ast.body[idx] as RelationalAtom).annotation = variable
      }
    }
  }

  ast.body = atoms

  return ast
}

function specifierAtom(set: SetVariable,
                       specifier: SpecifierTerm): SpecifierAtom { // tslint:disable-line:no-shadowed-variable
  return { type: 'specifier-atom',
           set,
           specifier,
         }
}

function maybeParse(parser: P.Parser<any>, str: string) {
  try {
    parser.tryParse(str)
  } catch (err) {
    return false
  }

  return true
}

export function isVariableName(name: string) {
  return maybeParse(MARPL.variableName, name)
}

export function isObjectName(name: string) {
  return maybeParse(MARPL.objectName, name)
}
