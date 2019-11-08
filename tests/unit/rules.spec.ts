import { parseRule } from '@/api/rules'
import { literals, variables, print } from '@/api/rules/ast'
import schema from '@/../data/rules.schema.json'

describe('api/rules', () => {
  const spouseRule = '(?x.P26 = ?y)@?S -> (?y.P26 = ?x)@?S'
  const grandmotherRule = '(?grandmother.P21 = Q6581072)@?X, (?grandmother.P40 = ?parent)@?Y, (?parent.P40 = ?child)@?Z -> (?child.P1038 = ?grandmother)@{P1039 = Q9235758}'
  const headOfGovernmentRule = '(?country.P6 = ?headOfGov)@?X, (?country.P1313 = ?headOffice)@?Y -> (?headOfGov.P39 = ?headOffice)@{}'

  it('parses a rule', () => {
    const rule = parseRule(grandmotherRule, schema)
    expect(rule.type).toBe('rule')
  })

  it('parses another rule', () => {
    const rule = parseRule(headOfGovernmentRule, schema)
    expect(rule.type).toBe('rule')
  })

  it('collects literals', () => {
    const rule = parseRule(spouseRule, schema)
    expect(rule.type).toBe('rule')

    const theLiterals = literals(rule)
    expect(theLiterals).toStrictEqual([{
      name: 'P26',
      type: 'literal',
    }])
  })

  it('collects variables', () => {
    const rule = parseRule(spouseRule, schema)
    expect(rule.type).toBe('rule')

    const theVariables = variables(rule)
    expect(theVariables).toStrictEqual([{
      name: '?x',
      type: 'variable',
    }, {
      name: '?y',
      type: 'variable',
    }, {
      name: '?S',
      type: 'set-variable',
    }])
  })

  it('prints a rule', () => {
    const rule = parseRule(spouseRule, schema)
    expect(rule.type).toBe('rule')

    const result = print(rule)
    expect(result).toBe(spouseRule)
  })

  it('prints another rule', () => {
    const rule = parseRule(grandmotherRule, schema)
    expect(rule.type).toBe('rule')

    const result = print(rule)
    expect(result).toBe(grandmotherRule)
  })

  it('prints yet another rule', () => {
    const rule = parseRule(headOfGovernmentRule, schema)
    expect(rule.type).toBe('rule')

    const result = print(rule)
    expect(result).toBe(headOfGovernmentRule)
  })
})
