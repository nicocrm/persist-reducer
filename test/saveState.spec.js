import saveState from '../src/saveState.js'

describe('saveState', () => {
  beforeEach(() => {
    delete window.localStorage['storage-key']
  })

  it('returns a function', () => {
    const result = saveState({storageKey: 'storage-key'}, x => x)
    result.should.be.a('function')
  })

  it('does not persist, when state has not changed', () => {
    const reducer = saveState({storageKey: 'storage-key'}, x => x)
    reducer({somestate: 'somevalue'}, {type: 'some action'})
    window.localStorage.should.not.have.property('storage-key')
  })

  it('persists to local storage, using specified key', () => {
    const reducer = saveState({storageKey: 'storage-key'}, x => ({somestate: 'somevalue'}))
    reducer({}, {type: 'some action'})
    window.localStorage.should.have.property('storage-key')
    window.localStorage['storage-key'].should.eql('{"somestate":"somevalue"}')
  })

  it('includes only specified keys', () => {
    const reducer = saveState({storageKey: 'storage-key', keysToSave: ['somestate']}, x => ({
      somestate: 'somevalue',
      otherstate: 'someothervalue'
    }))
    reducer({}, {type: 'some action'})
    window.localStorage.should.have.property('storage-key')
    window.localStorage['storage-key'].should.eql('{"somestate":"somevalue"}')
  })

  it('includes values in specified key paths', () => {
    const reducer = saveState(
      {storageKey: 'storage-key', keysToSave: ['somestate.someprop']},
      x => ({
        somestate: {
          someprop: 'somevalue',
          otherprop: 'othervalue'
        }
      })
    )
    reducer({}, {type: 'some action'})
    window.localStorage.should.have.property('storage-key')
    window.localStorage['storage-key'].should.eql('{"somestate.someprop":"somevalue"}')
  })

  it('includes values in specified key paths, with dotted keys', () => {
    const reducer = saveState(
      {storageKey: 'storage-key', keysToSave: [ ['somestate', 'dotted.prop'] ]},
      x => ({
        somestate: {
          'dotted.prop': 'somevalue',
          otherprop: 'othervalue'
        }
      })
    )
    reducer({}, {type: 'some action'})
    window.localStorage.should.have.property('storage-key')
    window.localStorage['storage-key'].should.eql('{"somestate,dotted.prop":"somevalue"}')
  })

  it('does not affect the returned state', () => {
    const reducer = saveState({storageKey: 'storage-key', keysToSave: ['somestate']}, x => ({
      somestate: 'somevalue',
      otherstate: 'someothervalue'
    }))
    const state = reducer({}, {type: 'some action'})
    state.should.eql({somestate: 'somevalue', otherstate: 'someothervalue'})
  })

  it('does not do anything when original state is empty', () => {
    const reducer = saveState({storageKey: 'storage-key', keysToSave: ['somestate']}, x => ({
      somestate: 'somevalue',
      otherstate: 'someothervalue'
    }))
    const state = reducer(null, {type: 'some action'})
    state.should.eql({somestate: 'somevalue', otherstate: 'someothervalue'})
    window.localStorage.should.not.have.property('storage-key')
  })

  it('does not persist, if no specified key has changed', () => {
    const reducer = saveState({storageKey: 'storage-key', keysToSave: ['somestate']}, x => ({
      somestate: 'somevalue',
      otherstate: 'someothervalue'
    }))
    reducer({
      somestate: 'somevalue'
    }, {type: 'some action'})
    window.localStorage.should.not.have.property('storage-key')
  })
})
