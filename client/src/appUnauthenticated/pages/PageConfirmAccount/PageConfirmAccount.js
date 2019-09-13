import React, { Fragment, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';

const Hero = styled.section`
  background-color: gray;
  height: 100vh;
`;
const Section = styled.section`
  display: flex;
  justify-content: center;
  padding-top: 10%;
`;
const Container = styled.section`
  flex-basis: 400px;
  padding: 50px;
  background-color: black;
  border-radius: 20px;
  box-shadow: 0px 20px 20px rgba(0, 0, 0, 0.1);
  color: white;
  h1 {
    font-size: 2rem;
    text-align: center;
    font-family: Roboto;
    color: ${props => props.theme.color.white};
  }
`;
const Redirect = styled.section`
  color: black;
  font-weight: 500;
  text-align: center;
  a {
    text-decoration: none;
    color: white;
    font-family: Roboto;
    font-style: normal;
    font-weight: 500;
    text-decoration: underline;
}
`;

export default function PageConfirmAccount(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(true);

    useEffect(() => {
      let isSubscribed = true;
      async function fetchData() {
          try {
              await axios.post('/users/confirmAccount', {emailHash: props.match.params.emailHash});
              if (isSubscribed) setIsError(false);
          } catch(err) { console.log(err); }
          if (isSubscribed) setIsLoading(false);
      }
      fetchData();
      return () =>isSubscribed = false;
    }, [props.match.params.emailHash]);

    return (
        <Hero>
            <Section>
                <Container>
                {!isLoading && isError && 
                  <Fragment>
                    <h1>Sorry but the link you provided is not working</h1>
                    <Redirect>
                      <p><Link to="/login">Login</Link></p>
                    </Redirect>
                  </Fragment>
                }
                {!isLoading && !isError &&
                  <Fragment>
                    <h1>Your account is now confirmed</h1>
                    <Redirect>
                      <p><Link to="/login">Login</Link></p>
                    </Redirect>
                  </Fragment>
                }
                </Container>
            </Section>
        </Hero>
    );
}