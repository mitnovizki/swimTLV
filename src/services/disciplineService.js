const axios = require('axios').default;

const xml2js = require('xml2js');

const debug = require('debug')('app:disciplineService');

const parser = xml2js.Parser({ explicitArray: false });

function disciplineService() {
  function getDisciplineById(id) {
    //  import axios from "axios";
    const options = {
      method: 'GET',
      url: 'https://wft-geo-db.p.rapidapi.com/v1/geo/cities',
      headers: {
        'x-rapidapi-key': '5bf4ef2362msh8981c0ac7cc1832p159595jsneec3cdd97796',
        'x-rapidapi-host': 'wft-geo-db.p.rapidapi.com'
      }
    };

    axios.request(options).then((response) => {
      // eslint-disable-next-line no-console
      console.log(response.data);
      parser.parseString(response.data, (err, result) => {
        if (err) {
          debug(err.stack);
        } else {
          debug(result);
        }
        // return result.data;
        return { description: 'lololololollo' };
      });
    }).catch((err) => {
      // eslint-disable-next-line no-console
      debug(err.stack);
    });

    // return new Promise((resolve, reject) => {
    //   resolve({ description: 'description lalalallalalalalalalalalallallalal' });
    //   axios.get();
    // }
  }
  return { getDisciplineById };
}
module.exports = disciplineService(); //! ()-> is being execyuted !!
