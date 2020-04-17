import React from 'react';
import Controls from '../Controls';
import PromptIcon from '../PromptIcon';
import Row from '../Row';

const SERVER = process.env.NODE_ENV === 'development' ? 'localhost' : '139.59.37.105';

// const Email = props => {
//   const ta = React.useRef(null);
//   const [value, setValue] = React.useState('');
//   const [submitted, setSubmitted] = React.useState(false);

//   React.useEffect(() => {
//     if (ta.current) {
//       ta.current.focus();
//     }
//   }, []);

//   const onSubmit = e => {
//     e.preventDefault();

//     setSubmitted(true);

//     if (props.item) {
//       props.item.next();
//     }
//   };

//   if (submitted) {
//     return (
//       <Row>
//         <PromptIcon success />
//         <div>{`email sent to ${props.contact.email}`}</div>
//       </Row>
//     );
//   }

//   return (
//     <form onSubmit={onSubmit}>
//       <div>
//         to:
//         {props.contact.email}
//       </div>
//       <div className="textarea">
//         <textarea
//           ref={ta}
//           value={value}
//           onChange={e => setValue(e.target.value)}
//           placeholder={`Write something to ${props.contact.name}`}
//         />
//       </div>
//       <Controls
//         onCancel={() => {
//           if (props.item) {
//             props.item.remove().next();
//           }
//         }}
//       />
//       <style jsx>
//         {`
//           form {
//             margin: 20px 0;
//           }
//           .textarea {
//             display: flex;
//           }
//           textarea {
//             flex: 1 1 auto;
//             min-height: 200px;
//             margin: 10px 0;
//             padding: 10px;
//           }
//         `}
//       </style>
//     </form>
//   );
// };

const RoutePage = props => {
  // console.log(props);
  React.useEffect(() => {
    // console.log(props);
    // if (props.item) {
    //   props.item.session.reset();
    // }
    if (props.item) {
      var win = window.open(`http://${SERVER}:8080/${props.page}/${props.device.id}`, '_blank');
      win.focus();
      props.item.next();
    }

    // window.scrollTo({ top: 0, left: 0 });
  }, []);
  return <div />;
}

export default (searchDevice, page) => {
  return {
    description: 'View page',
    commands: async query => {
      const res = await searchDevice(query);

      if (res.data.searchDevice) {
        return res.data.searchDevice.reduce((acc, device) => {
          acc[device.location] = {
            description: device.name,
            run: () => <RoutePage page={page} device={device} />
          };

          return acc;
        }, {});
      }

      return {};
    }
  };
};
