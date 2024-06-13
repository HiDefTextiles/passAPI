Það er reset í hvert skipti sem við tengjumst núverandi plan

Það þurfa að líða 2s frá því að node js tengist arduino í gegnum serial.

# Leiðbeiningar sem eg sendi snæju copy og paste

Formattið er eftirfarandi.
https Post request á localhost:3000/pattern
Sem hefur body sem inniheldur json gögn ( þetta er jafngild að senda object í python );
ítarefni ( https://medium.com/@DoneWithWork/mastering-http-requests-with-pythons-requests-module-an-intermediate-guide-9c54ee173768 )
Hérna er data í raun json objectið sem skilast til vélarinar.
response = requests.post(url, data=data)

MediumMedium
Mastering HTTP Requests with Python’s Requests Module: An Intermediate Guide
In the vast landscape of web development and data manipulation, the ability to communicate with web services and fetch data from the…
Reading time
4 min read
Dec 31st, 2023
https://medium.com/@DoneWithWork/mastering-http-requests-with-pythons-requests-module-an-intermediate-guide-9c54ee173768



elias ludviksson
  11:20 PM
Json objectið, eða bara object í python á að lýta svona út;
{
    "start": -10,
    "pattern": [
        [0,0,0,2,2,2],
        [2,2,2,0,0,0],
        [0,0,0,1,1,1],
        [1,1,1,0,0,0]
],
        "msg": ["test","",""]
}
** start
Þessi stiki seigir til um hvaða nál er lengst til vinstri á munstrinu, -90 er nálin lengst til vinstr, allar nálar vinstra megin við miðju eru neikvæðar
hægra megin eru jákvæðar
** pattern
Munstrið er á forminu þar sem hver lína inniheldur 0 eða 1-4;
Sléttar tölur 0,2,4,6.... er þegar vagninn fer frá vinstri til hægri,
frá enda að litaskipti
Odda tölur er þegar vagninn fer frá litaskipti að enda
Það er skrifað í console hor megin þú ert við munstrið og hvaða línu þú ert að fara að gera næst
Einnig er gefin litur sem á að vera í notkun 1-4
Litur er fenginn með því að taka hæsta rauntölu gildið í línu og prenta það út svo þið vitið hvaða litur er í gangi,
11:22
Hugmyndinn með að hafa þetta svona er svo að þú getir verið með sem dæmi
[1,1,1,1] 0, þannig hann prjónar allar í fyrstu umferð
[0,0,0,0] 1, en svo engar á baka leiðinni,
Þetta er einhver gerð af prjóna tækni, og gefur þetta okkur kleyft að gera allskyns munstur.
11:23
Við styðjum því allskyns áferðir og 4a liti í raun, endilega spurðu og ég svara við næsta tækifæri

