import { parseRule } from '@/api/rules'
import { literals, variables } from '@/api/rules/ast'
import schema from '@/../data/rules.schema.json'

describe('api/rules', () => {
  const spouseRule = '(?x.P26 = ?y)@?S -> (?y.P26 = ?x)@?S'
  const grandmotherRule = '(?grandmother.P21 = Q6581072)@?X, (?grandmother.P40 = ?parent)@?Y, (?parent.P40 = ?child)@?Z -> (?child.P1038 = ?grandmother)@[P1039 = Q9235758]'
  const headOfGovernmentRule = '(?country.P6 = ?headOfGov)@?X, (?country.P1313 = ?headOffice)@?Y -> (?headOfGov.P39 = ?headOffice)@[]'

  it('parses a rule', () => {
    const result = parseRule(grandmotherRule, schema)
    expect(result.type).toBe('rule')
  })

  it('parses another rule', () => {
    const result = parseRule(headOfGovernmentRule, schema)
    expect(result.type).toBe('rule')
  })

  it('collects literals', () => {
    const result = parseRule(spouseRule, schema)
    expect(result.type).toBe('rule')

    const theLiterals = literals(result)
    expect(theLiterals).toStrictEqual([{
      name: 'P26',
      type: 'literal',
    }])
  })

  it('collects variables', () => {
    const result = parseRule(spouseRule, schema)
    expect(result.type).toBe('rule')

    const theVariables = variables(result)
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
})
