import React from 'react';
import { useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import PromptIcon from '../PromptIcon';
import Row from '../Row';
// import Traffic from '../../components/Traffic';

const LOGREQUEST = gql`
  mutation logRequest($deviceId: String!, $date: String!, $type: String!) {
    logRequest(deviceId: $deviceId, date: $date, type: $type) {
      success
      error
    }
  }
`;

function typeDisplay(type) {
  switch(type) {
    case 'excel':
      return 'Energy Excel Report';
    case 'changeLogs':
      return 'Change Logs';
    case 'allLogs':
      return 'All Logs';
    default:
      return '';
  }
}

const Device = props => {
  const ta = React.useRef(null);
  const [date, setDate] = React.useState('');
  const [type, setType] = React.useState('excel');
  const [submitted, setSubmitted] = React.useState(false);
  const [logRequest, { data }] = useMutation(LOGREQUEST);

  console.log(props);

  React.useEffect(() => {
    if (ta.current) {
      ta.current.focus();
    }
  }, []);

  const onSubmit = async e => {
    e.preventDefault();

    console.log('Submit here');
    console.log(date);
    console.log(type);

    setSubmitted(true);

    await logRequest({ variables: { deviceId: props.device.id, date, type }});

    if (props.item) {
      props.item.next();
    }
  };

  if (submitted) {
    if (data && data.logRequest.success) {
      return (
        <Row>
          <PromptIcon success />
      <a href={data.logRequest.success} target="_blank">Download Link for {typeDisplay(type)} - {date}</a>
        </Row>
      );
      // return <Traffic />;
    } else if (data && data.logRequest.error) {
      return (
        <Row>
          <PromptIcon success />
          <div>{`${typeDisplay(type)} Requested for ${props.device.location}, failed please try again`}</div>
        </Row>
      );
    }
    return (
      <Row>
        <PromptIcon success />
        <div>{`${typeDisplay(type)} Requested for ${props.device.location}, please wait ...`}</div>
      </Row>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      <div>
        <label>Device:</label>
        {props.device.location}
      </div>
      <div className="dateSelector">
        <label>For Date:</label>
        <input
          required
          type="date"
          ref={ta}
          value={date}
          onChange={e => setDate(e.target.value)}
        />
      </div>
      <div className="typeSelector">
        <label>Export Type:</label>
        <select required onChange={e => setType(e.target.value)}>
          <option value="excel">Energy Excel</option>
          <option value="changeLogs">Change Logs</option>
          <option value="excelChange">Change Logs Excel</option>
          <option value="allLogs">All Logs</option>
        </select>
      </div>
      <div>
        <button onClick={() => {
            if (props.item) {
              props.item.remove().next();
            }
          }} type="button">
          cancel
        </button>
        <button type="submit">{props.text || 'submit'}</button>
      </div>
      <style jsx>
        {`
          form {
            margin: 20px 0;
          }
          .dateSelector {
            margin: 16px auto;
          }
          .typeSelector {
            margin-bottom: 16px;
          }
          label {
            display: block;
          }
          select {
            background: transparent;
            color: white;
            max-width: 150px;
            width: 100%;
            height: 40px;
          }
          button {
            margin-right: 16px;
          }
        `}
      </style>
    </form>
  );
};

export default searchDevice => {
  return {
    description: 'Device Logs',
    commands: async query => {
      const res = await searchDevice(query);

      if (res.data.searchDevice) {
        return res.data.searchDevice.reduce((acc, device) => {
          acc[device.location] = {
            description: device.name,
            run: () => <Device device={device} />
          };

          return acc;
        }, {});
      }

      return {};
    }
  };
};
