export type SpecifierType = 'open' | 'closed'
export type SpecifierExpressionType = 'union' | 'intersection' | 'difference'

export interface Named {
  name: string,
}

export interface SomeVariable extends Named {
  type: 'some-variable',
}

export interface Variable extends Named {
  type: 'variable',
}

export interface Literal extends Named {
  type: 'literal',
}

export interface LiteralExpression extends Named {
  type: 'literal-expression',
}

export type ObjectTerm = Variable | Literal

export interface SetVariable extends Named {
  type: 'set-variable',
}

export type SimpleNamed = SomeVariable | Variable | Literal | SetVariable | LiteralExpression

export interface Assigning {
  assignments: Assignment[],
}

export interface SetLiteral extends Assigning {
  type: 'set-term',
}

export type SetTerm = SetVariable | SetLiteral | Specifier
export type Annotation = SetTerm | ClosedSpecifier | FunctionTerm
export type Assignments = SetLiteral | OpenSpecifier | ClosedSpecifier

export interface Star {
  type: 'star',
}

export interface Plus {
  type: 'plus',
}

export type Placeholder = Star | Plus

export interface Assignment {
  type: 'assignment',
  attribute: ObjectTerm,
  value: ObjectTerm | Dot | Placeholder,
}

export interface Dot {
  type: 'dot',
  fromSpecifier: SetVariable,
  item: Literal,
}

export interface OpenSpecifier extends Assigning {
  type: 'open-specifier',
}

export interface ClosedSpecifier extends Assigning {
  type: 'closed-specifier',
}

export interface RelationalAtom {
  type: 'relational-atom',
  predicate: ObjectTerm,
  arguments: [ObjectTerm, ObjectTerm | LiteralExpression],
  annotation: Annotation,
}

export type Argument = Literal | SetLiteral | SomeVariable | SetVariable | Variable

export interface FunctionTerm extends Named {
  type: 'function-term',
  arguments: Argument[],
}

export interface SetLikeAtom {
  set: SetVariable,
  specifier: SpecifierTerm,
}

export interface SetAtom extends SetLikeAtom {
  type: 'set-atom',
}

export interface SpecifierAtom extends SetLikeAtom {
  type: 'specifier-atom',
}

export interface ComplexSpecifier {
  type: SpecifierExpressionType,
  specifiers: SpecifierTerm[],
}

export interface Union extends ComplexSpecifier {
  type: 'union',
}

export interface Intersection extends ComplexSpecifier {
  type: 'intersection',
}

export interface Difference extends ComplexSpecifier {
  type: 'difference',
}

export type Specifier = OpenSpecifier | ClosedSpecifier
export type SpecifierTerm = Specifier | ComplexSpecifier
export type Atom = RelationalAtom | SetAtom | SpecifierAtom

export interface Rule {
  type: 'rule',
  head: RelationalAtom,
  body: Atom[],
}

export type ParseResult = SomeVariable | Variable | Literal |
  SetVariable | SetLiteral | Star | Plus | Assignment | Dot |
  OpenSpecifier | ClosedSpecifier | FunctionTerm | SetAtom |
  SpecifierAtom | Union | Intersection | Difference | Rule |
  RelationalAtom | LiteralExpression

export interface MARPL {
  at: string,
  dot: string,
  comma: string,
  colon: string,
  arrow: string,
  union: string,
  equals: string,
  difference: string,
  intersection: string,
  objectName: string,
  literalExpression: string,
  variableName: string,
  openingBrace: string,
  closingBrace: string,
  openingFloor: string,
  closingFloor: string,
  openingBracket: string,
  closingBracket: string,
  openingParenthesis: string,
  closingParenthesis: string,
  someVariable: SomeVariable,
  ObjectVariable: Variable,
  ObjectLiteral: Literal,
  LiteralExpression: LiteralExpression,
  ObjectTerm: ObjectTerm,
  ObjectTermOrLiteral: ObjectTerm | LiteralExpression,
  SetLiteral: SetLiteral,
  SetVariable: SetVariable,
  SetTerm: SetTerm,
  DottedSetTerm: SetTerm | ClosedSpecifier,
  FunctionTerm: FunctionTerm,
  RelationalAtom: RelationalAtom,
  RelationalAtomWithFunctionTerm: RelationalAtom,
  RelationalAtomWithDots: RelationalAtom,
  SimpleRelationalAtom: RelationalAtom,
  Dot: Dot,
  Placeholder: Star | Plus,
  Assignment: Assignment,
  AssignmentWithPlaceholder: Assignment,
  DottedAssignment: Assignment,
  Specifier: OpenSpecifier | ClosedSpecifier,
  SpecifierExpression: ComplexSpecifier,
  SpecifierTerm: SpecifierTerm
  SpecifierAtom: SpecifierAtom,
  Rule: Rule,
  Head: RelationalAtom,
  Body: Atom[],
}

export function isSomeVariable(thing: Argument): thing is SomeVariable {
  return thing.type === 'some-variable'
}

export function isSetVariable(thing: Annotation): thing is SetVariable {
  return thing.type === 'set-variable'
}

export function isRelationalAtom(thing: Atom): thing is RelationalAtom {
  return thing.type === 'relational-atom'
}

export function isSetAtom(thing: Atom): thing is SetAtom {
  return thing.type === 'set-atom'
}

export function isSpecifierAtom(thing: Atom): thing is SpecifierAtom {
  return thing.type === 'specifier-atom'
}

export function isSetLikeAtom(thing: Atom): thing is SpecifierAtom | SetAtom {
  return isSpecifierAtom(thing) || isSetAtom(thing)
}

export function isOpenSpecifier(thing: SpecifierTerm | Annotation): thing is OpenSpecifier {
  return thing.type === 'open-specifier'
}

export function isClosedSpecifier(thing: SpecifierTerm | Annotation): thing is ClosedSpecifier {
  return thing.type === 'closed-specifier'
}

export function isSpecifier(thing: SpecifierTerm | Annotation): thing is Specifier {
  return isOpenSpecifier(thing) || isClosedSpecifier(thing)
}
