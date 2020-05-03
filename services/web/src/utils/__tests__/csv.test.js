import { processText } from '../csv';

const tokensImportMapping = {
  uid: {
    required: true,
    matches: ['UID'],
    exactMatches: ['uid', 'UID']
  },
  customId: {
    required: true,
    exactMatches: ['Custom ID', 'custom_id', 'custom id', 'laadpasnummer']
  },
  type: {
    exactMatches: ['Type', 'type'],
    defaultValue: 'mifare'
  }
};

const chargeSessionsImportMapping = {
  externalId: {
    required: true,
    exactMatches: ['CDR_ID', 'CDR ID']
  },
  startedAt: {
    required: true,
    exactMatches: ['Start_datetime', 'Start'],
    type: 'datetime'
  },
  endedAt: {
    required: true,
    exactMatches: ['End_datetime', 'End'],
    type: 'datetime'
  },
  durationSeconds: {
    required: false,
    exactMatches: ['Duration'],
    type: 'duration'
  },
  kwh: {
    required: true,
    exactMatches: ['Volume', 'KWh'],
    type: 'europeanOrAmericanNumber'
  },
  'chargeLocation.address': {
    required: true,
    exactMatches: ['Charge_Point_Address', 'Address']
  },
  'chargeLocation.postalCode': {
    required: true,
    exactMatches: ['Charge_Point_ZIP', 'Postcode']
  },
  'chargeLocation.city': {
    required: true,
    exactMatches: ['Charge_Point_City', 'City']
  },
  'chargeLocation.countryCode': {
    required: true,
    exactMatches: ['Charge_Point_Country', 'Country'],
    parseFn: (value) => {
      if (value === 'NLD') return 'NL';
      return value;
    }
  },
  tokenUid: {
    required: true,
    exactMatches: ['Authentication_ID', 'Authentication ID']
  },
  tokenContractId: {
    required: true,
    exactMatches: ['Contract_ID', 'Contract ID']
  },
  chargePointId: {
    required: true,
    exactMatches: ['Charge_Point_ID', 'Charge Point ID']
  },
  serviceProviderId: {
    required: true,
    exactMatches: ['Service_Provider_ID', 'Service Provider ID']
  },
  infraProviderId: {
    required: true,
    exactMatches: ['Infra_Provider_ID', 'Infra Provider ID']
  },
  connectorType: {
    required: false,
    exactMatches: ['Connector type']
  },
  status: {
    required: false,
    exactMatches: ['Status']
  },
  externalCalculatedPrice: {
    required: true,
    exactMatches: ['Calculated_Cost', 'Price (EUR)'],
    type: 'europeanOrAmericanNumber'
  },
  importSource: {
    required: false,
    defaultValue: 'csv',
    exactMatches: ['Import_Source']
  }
};

describe('utils/csv', () => {
  it('does basic processText', () => {
    const csv = `recordID,UID hex MSB,laadpasnummer,,
1,040E7E32345B81,NL-EFL-C57122125-N,,`;
    const { items, numColumnsMatched } = processText(tokensImportMapping, csv);
    expect(items.length).toBe(1);
    expect(numColumnsMatched).toBe(2);
    expect(Object.keys(items[0])).toEqual(['uid', 'customId', 'type']);
    expect(items[0].uid).toBe('040E7E32345B81');
    expect(items[0].customId).toBe('NL-EFL-C57122125-N');
    expect(items[0].type).toBe('mifare');
  });
  it('does reject missing required columns', () => {
    const csv = `recordId,UIID hex MSB,laadpasnummer,,
1,040E7E32345B81,NL-EFL-C57122125-N,,`;
    expect(() => {
      processText(tokensImportMapping, csv);
    }).toThrow(/required/);
  });
  it('does advanced processText with type conversions', () => {
    const csv = `CDR_ID,Start_datetime,End_datetime,Duration,Volume,Charge_Point_Address,Charge_Point_ZIP,Charge_Point_City,Charge_Point_Country,Charge_Point_Type,Product_Type,Tariff_Type,Authentication_ID,Contract_ID,Meter_ID,OBIS_Code,Charge_Point_ID,Service_Provider_ID,Infra_Provider_ID,Calculated_Cost
4417291,2019-01-15T07:50:31+00:00,2019-01-15T15:35:44+00:00,07:45:12,"8,7900",Marktplein 1,8161 EE,Epe,NLD,3,3,0,043F5A32345B84,NLEFL000001003,,,NLALLEGO002953,NLEFL,NLALL,"2,4700"
4391842,2019-01-11T15:58:32+00:00,2019-01-11T16:32:23+00:00,00:33:51,"22,0600",Kleine Koppel 15,3812 PG,Amersfoort,NLD,5,5,0,0449676AE05C85,NLEFL000001144,,,NLALLEGO000927,NLEFL,NLALL,"12,5742"
4388004,2019-01-11T07:36:52+00:00,2019-01-11T15:59:36+00:00,08:22:43,"7,6400",Kinkelenburglaan 6,6681 BJ,Bemmel,NLD,3,3,0,04044D6AE05C85,NLEFL000000745,,,NLALLEGO000850,NLEFL,NLALL,"2,1468"
4391972,2019-01-11T16:11:06+00:00,2019-01-11T18:57:21+00:00,02:46:15,"2,6900",Beetwortelweg 55,3263 EA,Oud-Beijerland,NLD,3,3,0,04572832345B85,NLEFL000001441,,,NLALLEGO001632,NLEFL,NLALL,"0,7559"
`;
    const { items, numColumnsMatched } = processText(
      chargeSessionsImportMapping,
      csv
    );
    expect(items.length).toBe(4);
    expect(numColumnsMatched).toBe(15);
    expect(Object.keys(items[0].chargeLocation)).toEqual([
      'address',
      'postalCode',
      'city',
      'countryCode'
    ]);
    expect(items[0].chargeLocation.city).toBe('Epe');
    expect(items[0].chargeLocation.countryCode).toBe('NL');
    expect(items[0].kwh).toBe(8.79);
    expect(items[0].externalCalculatedPrice).toBe(2.47);
    expect(items[0].durationSeconds).toBe(27912);
    expect(items[0].startedAt).toBe('2019-01-15T07:50:31.000Z');
  });
  it('does advanced processText on similar file', () => {
    const csv = `CDR ID,Start,End,Duration,KWh,Charging location,Address,Postcode,City,Country,Connector type,Authentication ID,Contract ID,Charge Point ID,Service Provider ID,Infra Provider ID,Status,Price (EUR)
4315838,2019-01-01 01:32,2019-01-01 09:40,8:07:43,6.38,,Euterpeplein 34 C,3816 NP,Amersfoort,NLD,Type 2,041E3632345B85,1245,NLALLEGO0050672,sp_eflux,NLALL,Finished,1.92
GFX-63681947076508594796,2019-01-01 01:44,2019-01-01 14:44,12:59:46,30.29,,Pruimengaarde 1,3992 JK,Houten,NLD,,04963032345B80,356,PP001707,sp_eflux,cp_eflux_eclearing,Finished,8.14
TNM169046,2019-01-01 02:09,2019-01-01 12:31,10:22:01,6.656,Wintertuinlaan-1,Wintertuinlaan 1,3452RE,Utrecht,NLD,Type 2,0491C332345B80,592,NLTNMEUTPITEN360*0,sp_eflux,NLTNM,Finished,1.8
NLLMS4145553,2019-01-01 02:14,2019-01-01 16:21,14:06:38,22.17,"Hongarenburg nabij 115, Den Haag, NL",Hongarenburg nabij 115,2591 VK,Den Haag,NLD,Type 2,0476E932345B81,1182,NLLMSE1701449*2,sp_eflux,NLLMS,Finished,5.54
`;
    const { items, numColumnsMatched } = processText(
      chargeSessionsImportMapping,
      csv
    );
    expect(items.length).toBe(4);
    expect(numColumnsMatched).toBe(17);
    expect(Object.keys(items[0].chargeLocation)).toEqual([
      'address',
      'postalCode',
      'city',
      'countryCode'
    ]);
    expect(items[0].chargeLocation.city).toBe('Amersfoort');
    expect(items[0].chargeLocation.countryCode).toBe('NL');
    expect(items[0].kwh).toBe(6.38);
    expect(items[0].externalCalculatedPrice).toBe(1.92);
    expect(items[0].durationSeconds).toBe(29263);
    expect(items[0].connectorType).toBe('Type 2');
    expect(items[0].status).toBe('Finished');
    expect(items[0].startedAt).toBe('2018-12-31T16:32:00.000Z');
  });
});
