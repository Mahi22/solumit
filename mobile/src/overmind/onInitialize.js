const SERVER = process.env.NODE_ENV === 'development' ? '192.168.0.100' : '139.59.37.105';

export const onInitialize = ({ effects }) => {
  effects.gql.initialize({
    // query and mutation options
    endpoint: `http://${SERVER}:8080/graphql`
  }, {
    // subscription options
    endpoint: `ws://${SERVER}:8080/graphql`
  })
}
