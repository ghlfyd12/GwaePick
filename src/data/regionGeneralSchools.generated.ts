/**
 * [자동 생성 — 손으로 수정하지 말 것]
 * 지역×과목 pSEO 인근 학교(중2·고2) — 전국 시군구 "일반계 대표 학교" 자동 산출본.
 *
 * 생성일: 2026-08-05
 * 생성 스크립트: scripts/generate-region-general-schools.mjs (NEIS schoolInfo + schools.ts 매칭)
 * 분류 규칙: 고 = NEIS HS_SC_NM 일반고·자율고 포함 / 특성화·특목 제외 / 매칭실패 제외.
 *            중 = 교명 필터(공업·예술·국제 등) 후 가나다순. 학교풀별 중2·고2(가나다).
 * 수록 범위: 현행 가나다순과 결과가 달라지는 학교풀만(동일 풀은 생략).
 * 우선순위: regionFeaturedSchools(수동) → 이 파일(자동) → 가나다순. (lib/regionSchoolPick.ts)
 * key = schools.ts 시군구 풀 slug(`${sidoSlug}/${sigunguSlug}`). 경기 시 단위는 런타임에서 구 route 로 확장.
 */
export const regionGeneralSchools: Record<
  string,
  { middle?: string[]; high?: string[] }
> = {
  "busan/geumjeonggu": { middle: ["guseoyeojung", "geumsajung"], high: ["geumjeongyeogo", "namsango"] }, // 금정구 · 중 구서여중·금사중 / 고 금정여고·남산고
  "busan/haeundaegu": { middle: ["dongbaekjung-haeundaegu", "bansongyeojung"], high: ["banyeogo", "buheunggo-haeundaegu"] }, // 해운대구 · 중 동백중·반송여중 / 고 반여고·부흥고
  "busan/namgu": { middle: ["gammanjung", "namcheonjung"], high: ["daeyeongo", "dongcheongo"] }, // 남구 · 중 감만중·남천중 / 고 대연고·동천고
  "busan/sahagu": { middle: ["gamcheonjung-sahagu", "geongukjung"], high: ["geongukgo", "dadaego"] }, // 사하구 · 중 감천중·건국중 / 고 건국고·다대고
  "busan/seogu": { middle: ["gyeongnamjung", "daesinyeojung"], high: ["gyeongnamgo", "bugyeonggo"] }, // 서구 · 중 경남중·대신여중 / 고 경남고·부경고
  "busan/suyeonggu": { middle: ["gwanganjung", "dongsuyeongjung"], high: ["deokmunyeogo", "busandongyeogo"] }, // 수영구 · 중 광안중·동수영중 / 고 덕문여고·부산동여고
  "busan/yeongdogu": { middle: ["namdoyeojung", "dongsamjung"], high: ["gwangmyeonggo-yeongdogu", "yeongdoyeogo"] }, // 영도구 · 중 남도여중·동삼중 / 고 광명고·영도여고
  "busan/yeonjegu": { middle: ["geoseongjung", "geojeyeojung"], high: ["yeonjego", "isabelgo"] }, // 연제구 · 중 거성중·거제여중 / 고 연제고·이사벨고
  "chungbuk/cheongjusicheongwongu": { middle: ["gakrijung", "naesujung"], high: ["sinheunggo-cheongjusicheongwongu", "yangcheonggo"] }, // 청주시 청원구 · 중 각리중·내수중 / 고 신흥고·양청고
  "chungbuk/cheongjusiheungdeokgu": { middle: ["gagyeongjung", "gyeongdeokjung"], high: ["bongmyeonggo", "seowongo-cheongjusiheungdeokgu"] }, // 청주시 흥덕구 · 중 가경중·경덕중 / 고 봉명고·서원고
  "chungbuk/cheongjusisangdanggu": { middle: ["gadeokjung", "geumcheonjung"], high: ["geumcheongo-cheongjusisangdanggu", "sangdanggo"] }, // 청주시 상당구 · 중 가덕중·금천중 / 고 금천고·상당고
  "chungbuk/chungjusi": { middle: ["noeunjung", "daesowonjung"], high: ["gugwongo", "jungangtapgo"] }, // 충주시 · 중 노은중·대소원중 / 고 국원고·중앙탑고
  "chungbuk/danyanggun": { middle: ["gagokjung-danyanggun", "dansanjung"], high: ["danyanggo"] }, // 단양군 · 중 가곡중·단산중 / 고 단양고
  "chungbuk/jecheonsi": { middle: ["naetojung", "daejejung"], high: ["semyeonggo", "jecheongo"] }, // 제천시 · 중 내토중·대제중 / 고 세명고·제천고
  "chungbuk/jeungpyeonggun": { middle: ["jeungpyeongyeojung", "jeungpyeongjung"], high: ["hyeongseokgo"] }, // 증평군 · 중 증평여중·증평중 / 고 형석고
  "chungbuk/yeongdonggun": { middle: ["saeneouljung", "simcheonjung"], high: ["yeongdonggo-yeongdonggun", "haksango"] }, // 영동군 · 중 새너울중·심천중 / 고 영동고·학산고
  "chungnam/cheonansidongnamgu": { middle: ["gaonjung", "gyegwangjung"], high: ["mokcheongo", "bokjayeogo"] }, // 천안시 동남구 · 중 가온중·계광중 / 고 목천고·복자여고
  "chungnam/cheonansiseobukgu": { middle: ["garamjung-cheonansiseobukgu", "dongseongjung-cheonansiseobukgu"], high: ["oseonggo"] }, // 천안시 서북구 · 중 가람중·동성중 / 고 오성고
  "chungnam/dangjinsi": { middle: ["godaejung", "dangjinjung"], high: ["dangjingo", "seoyago"] }, // 당진시 · 중 고대중·당진중 / 고 당진고·서야고
  "chungnam/geumsangun": { middle: ["geumsandongjung", "geumsanyeojung"], high: ["geumsango", "geumsanyeogo"] }, // 금산군 · 중 금산동중·금산여중 / 고 금산고·금산여고
  "chungnam/gongjusi": { middle: ["gyeongcheonjung", "gongjubukjung"], high: ["gongjugo", "gongjuyeogo"] }, // 공주시 · 중 경천중·공주북중 / 고 공주고·공주여고
  "chungnam/nonsansi": { middle: ["gayagokjung", "ganggyeongyeojung"], high: ["ganggyeonggo", "nonsango"] }, // 논산시 · 중 가야곡중·강경여중 / 고 강경고·논산고
  "chungnam/seocheongun": { middle: ["donggangjung", "biinjung"], high: ["seocheongo-seocheongun", "seocheonyeogo"] }, // 서천군 · 중 동강중·비인중 / 고 서천고·서천여고
  "daegu/dalseogu": { middle: ["gyeongamjung", "gunamjung"], high: ["gyeongwongo", "gyeonghwayeogo-dalseogu"] }, // 달서구 · 중 경암중·구남중 / 고 경원고·경화여고
  "daegu/donggu": { middle: ["gangdongjung-donggu", "gongsanjung"], high: ["gangdonggo-donggu", "daegudongbugo"] }, // 동구 · 중 강동중·공산중 / 고 강동고·대구동부고
  "daegu/gunwigun": { middle: ["gunwijung", "bugyejung"], high: ["gunwigo"] }, // 군위군 · 중 군위중·부계중 / 고 군위고
  "daegu/junggu": { middle: ["gyeonggujung", "gyeongbuksadaebujung"], high: ["gyeongbugyeogo", "sinmyeonggo"] }, // 중구 · 중 경구중·경북사대부중 / 고 경북여고·신명고
  "daegu/namgu": { middle: ["gyeongsangjung", "gyeongiryeojung"], high: ["gyeongiryeogo", "daegugo"] }, // 남구 · 중 경상중·경일여중 / 고 경일여고·대구고
  "daejeon/daedeokgu": { middle: ["daejeongyeongdeokjung", "daecheongjung-daedeokgu"], high: ["dongdaejeongo", "sintanjingo"] }, // 대덕구 · 중 대전경덕중·대청중 / 고 동대전고·신탄진고
  "daejeon/donggu": { middle: ["gayangjung", "gaojung"], high: ["daeseongyeogo", "daejeongaogo"] }, // 동구 · 중 가양중·가오중 / 고 대성여고·대전가오고
  "daejeon/seogu": { middle: ["gasuwonjung", "galmajung"], high: ["daejeonjeilgo", "dongbanggo"] }, // 서구 · 중 가수원중·갈마중 / 고 대전제일고·동방고
  "daejeon/yuseonggu": { middle: ["gwanpyeongjung", "noeunjung-yuseonggu"], high: ["daedeokgo", "daejeondoango"] }, // 유성구 · 중 관평중·노은중 / 고 대덕고·대전도안고
  "gangwon/chuncheonsi": { middle: ["gajeongjung", "gangseojung-chuncheonsi"], high: ["gangwongo", "bonguigo"] }, // 춘천시 · 중 가정중·강서중 / 고 강원고·봉의고
  "gangwon/goseonggun": { middle: ["geojinjung", "goseongjung"] }, // 고성군 · 중 거진중·고성중 / 고 -
  "gangwon/hongcheongun": { middle: ["naemyeonjung", "naechonjung-hongcheongun"], high: ["naemyeongo", "seoseokgo"] }, // 홍천군 · 중 내면중·내촌중 / 고 내면고·서석고
  "gangwon/pyeongchanggun": { middle: ["gyechonjung", "daegwanryeongjung"], high: ["bongpyeonggo", "sangjidaegwanryeonggo"] }, // 평창군 · 중 계촌중·대관령중 / 고 봉평고·상지대관령고
  "gangwon/sokchosi": { middle: ["seorakjung-sokchosi", "seoronjung"], high: ["sokchogo", "sokchoyeogo"] }, // 속초시 · 중 설악중·설온중 / 고 속초고·속초여고
  "gangwon/wonjusi": { middle: ["gwiraejung", "namwonjujung"], high: ["munmakgo", "bugwonyeogo"] }, // 원주시 · 중 귀래중·남원주중 / 고 문막고·북원여고
  "gangwon/yeongwolgun": { middle: ["nokjeonjung", "machajung"], high: ["machago", "yeongwolgo"] }, // 영월군 · 중 녹전중·마차중 / 고 마차고·영월고
  "gwangju/bukgu": { middle: ["gakhwajung", "gyeongsinjung-bukgu"], high: ["goryeogo", "gwangjudongsingo"] }, // 북구 · 중 각화중·경신중 / 고 고려고·광주동신고
  "gwangju/donggu": { middle: ["mudeungjung", "salresioyeojung"], high: ["salresioyeogo", "jeonnamyeogo"] }, // 동구 · 중 무등중·살레시오여중 / 고 살레시오여고·전남여고
  "gwangju/gwangsangu": { middle: ["gosiljung", "gwangsanjung"], high: ["gwangilgo", "myeongjingo"] }, // 광산구 · 중 고실중·광산중 / 고 광일고·명진고
  "gwangju/namgu": { middle: ["daeseongyeojung-namgu", "daechonjung"], high: ["daegwangyeogo", "daeseongyeogo-namgu"] }, // 남구 · 중 대성여중·대촌중 / 고 대광여고·대성여고
  "gwangju/seogu": { middle: ["gwangdeokjung-seogu", "gwangjujung-seogu"], high: ["gwangjuyeogo", "sangmugo"] }, // 서구 · 중 광덕중·광주중 / 고 광주여고·상무고
  "gyeongbuk/andongsi": { middle: ["gyeongdeokjung-andongsi", "gyeonganyeojung"], high: ["gyeongango-andongsi", "gyeonganyeogo"] }, // 안동시 · 중 경덕중·경안여중 / 고 경안고·경안여고
  "gyeongbuk/bonghwagun": { middle: ["myeonghojung", "muryajung"], high: ["bonghwago"] }, // 봉화군 · 중 명호중·물야중 / 고 봉화고
  "gyeongbuk/cheongdogun": { middle: ["geumcheonjung-cheongdogun", "maejeonjung"], high: ["geumcheongo-cheongdogun", "mogyego"] }, // 청도군 · 중 금천중·매전중 / 고 금천고·모계고
  "gyeongbuk/cheongsonggun": { middle: ["gucheonjung", "nambujung"], high: ["jinbogo", "cheongsonggo"] }, // 청송군 · 중 구천중·남부중 / 고 진보고·청송고
  "gyeongbuk/chilgokgun": { middle: ["dongmyeongjung-chilgokgun", "buksamjung"], high: ["dongmyeonggo", "buksamgo"] }, // 칠곡군 · 중 동명중·북삼중 / 고 동명고·북삼고
  "gyeongbuk/gimcheonsi": { middle: ["gammunjung", "gaeryeongjung"], high: ["gimcheongo", "gimcheonyeogo"] }, // 김천시 · 중 감문중·개령중 / 고 김천고·김천여고
  "gyeongbuk/goryeonggun": { middle: ["goryeongjung", "dasanjung-goryeonggun"], high: ["daegayago"] }, // 고령군 · 중 고령중·다산중 / 고 대가야고
  "gyeongbuk/gumisi": { middle: ["gyeonggujung-gumisi", "gwangpyeongjung"], high: ["gyeonggugo", "gumigo"] }, // 구미시 · 중 경구중·광평중 / 고 경구고·구미고
  "gyeongbuk/gyeongjusi": { middle: ["gampojung", "gyeongjuyeojung"], high: ["gyeongjugo", "gyeongjuyeogo"] }, // 경주시 · 중 감포중·경주여중 / 고 경주고·경주여고
  "gyeongbuk/gyeongsansi": { middle: ["gyeongsanyeojung", "gyeongsanjeiljung"], high: ["gyeongsango", "gyeongsanyeogo"] }, // 경산시 · 중 경산여중·경산제일중 / 고 경산고·경산여고
  "gyeongbuk/mungyeongsi": { middle: ["gaeunjung-mungyeongsi", "dongrojung"], high: ["gaeungo", "mungyeongyeogo"] }, // 문경시 · 중 가은중·동로중 / 고 가은고·문경여고
  "gyeongbuk/pohangsi": { middle: ["guryongpojung", "gigyejung"], high: ["daedonggo", "dongjigo"] }, // 포항시 · 중 구룡포중·기계중 / 고 대동고·동지고
  "gyeongbuk/sangjusi": { middle: ["nakdongjung", "nagunjung"], high: ["sangjugo", "sangjuyeogo"] }, // 상주시 · 중 낙동중·낙운중 / 고 상주고·상주여고
  "gyeongbuk/seongjugun": { middle: ["myeonginjung-seongjugun", "byeokjinjung"], high: ["seongjugo", "seongjuyeogo"] }, // 성주군 · 중 명인중·벽진중 / 고 성주고·성주여고
  "gyeongbuk/uiseonggun": { middle: ["gyeongbukjungbujung", "geumseongjung"], high: ["geumseonggo", "angyego"] }, // 의성군 · 중 경북중부중·금성중 / 고 금성고·안계고
  "gyeongbuk/uljingun": { middle: ["giseongjung-uljingun", "maehwajung-uljingun"], high: ["uljingo", "jukbyeongo"] }, // 울진군 · 중 기성중·매화중 / 고 울진고·죽변고
  "gyeongbuk/yeongcheonsi": { middle: ["gogyeongjung", "geumhoyeojung"], high: ["seongnamyeogo-yeongcheonsi", "yeongdonggo-yeongcheonsi"] }, // 영천시 · 중 고경중·금호여중 / 고 성남여고·영동고
  "gyeongbuk/yeongdeokgun": { middle: ["ganggujung", "namjeongjung"], high: ["yeongdeokgo-yeongdeokgun", "yeongdeogyeogo"] }, // 영덕군 · 중 강구중·남정중 / 고 영덕고·영덕여고
  "gyeongbuk/yeongjusi": { middle: ["geumgyejung", "dansanjung-yeongjusi"], high: ["daeyeonggo-yeongjusi", "yeonggwanggo"] }, // 영주시 · 중 금계중·단산중 / 고 대영고·영광고
  "gyeonggi/ansan": { middle: ["gyeongsujung", "gwansanjung"], high: ["gyeongango", "gojango"] }, // 안산 · 중 경수중·관산중 / 고 경안고·고잔고
  "gyeonggi/anyang": { middle: ["gwanyangjung", "gwiinjung"], high: ["gwanyanggo", "dongango"] }, // 안양 · 중 관양중·귀인중 / 고 관양고·동안고
  "gyeonggi/bucheon": { middle: ["gyenamjung", "kkachiuljung"], high: ["gyenamgo", "deoksango"] }, // 부천 · 중 계남중·까치울중 / 고 계남고·덕산고
  "gyeonggi/dongducheon": { middle: ["dongducheonyeojung", "dongducheonjung"], high: ["dongducheongo", "dongducheonjunganggo"] }, // 동두천 · 중 동두천여중·동두천중 / 고 동두천고·동두천중앙고
  "gyeonggi/goyang": { middle: ["garamjung", "goyangsongsanjung"], high: ["gajwago", "goyangdongsango"] }, // 고양 · 중 가람중·고양송산중 / 고 가좌고·고양동산고
  "gyeonggi/gunpo": { middle: ["gokranjung", "gunpojung"], high: ["gunpogo", "gunpojunganggo"] }, // 군포 · 중 곡란중·군포중 / 고 군포고·군포중앙고
  "gyeonggi/gwangmyeong": { middle: ["garimjung", "gwangnamjung"], high: ["gwangmyeonggo", "gwangmyeongbukgo"] }, // 광명 · 중 가림중·광남중 / 고 광명고·광명북고
  "gyeonggi/hanam": { middle: ["gamilbaekjejung", "gamiljung"], high: ["gamilgo", "namhango"] }, // 하남 · 중 감일백제중·감일중 / 고 감일고·남한고
  "gyeonggi/osan": { middle: ["gasujung", "daehojung"], high: ["maeholgo", "seonghogo"] }, // 오산 · 중 가수중·대호중 / 고 매홀고·성호고
  "gyeonggi/pyeongtaek": { middle: ["dogokjung", "dongsakjung"], high: ["raongo", "bijeongo"] }, // 평택 · 중 도곡중·동삭중 / 고 라온고·비전고
  "gyeonggi/seongnam": { middle: ["geumgwangjung", "nagwonjung"], high: ["naksaenggo", "neulpureungo"] }, // 성남 · 중 금광중·낙원중 / 고 낙생고·늘푸른고
  "gyeonggi/siheung": { middle: ["gunseojung", "gunjajung"], high: ["gunseogo", "mokgamgo"] }, // 시흥 · 중 군서중·군자중 / 고 군서고·목감고
  "gyeonggi/suwon": { middle: ["gosaekjung", "gokbanjung"], high: ["gosaekgo", "gokjeonggo"] }, // 수원 · 중 고색중·곡반중 / 고 고색고·곡정고
  "gyeonggi/uijeongbu": { middle: ["gyeongminyeojung", "gyeongminjung"], high: ["gyeongmingo", "balgokgo"] }, // 의정부 · 중 경민여중·경민중 / 고 경민고·발곡고
  "gyeonggi/uiwang": { middle: ["galmoejung", "gocheonjung"], high: ["morakgo", "baegungo"] }, // 의왕 · 중 갈뫼중·고천중 / 고 모락고·백운고
  "gyeonggi/yeoju": { middle: ["gangcheonjung", "daesinjung"], high: ["daesingo", "sejonggo"] }, // 여주 · 중 강천중·대신중 / 고 대신고·세종고
  "gyeongnam/changnyeonggun": { middle: ["namjiyeojung", "namjijung"], high: ["namjigo", "yeongsango-changnyeonggun"] }, // 창녕군 · 중 남지여중·남지중 / 고 남지고·영산고
  "gyeongnam/changwonsi": { middle: ["gamgyejung", "gyeongwonjung-changwonsi"], high: ["gyeongsanggo-changwonsi", "masango"] }, // 창원시 · 중 감계중·경원중 / 고 경상고·마산고
  "gyeongnam/geojesi": { middle: ["geojesangmunjung", "geojejangpyeongjung"], high: ["geojego", "geojesangmungo"] }, // 거제시 · 중 거제상문중·거제장평중 / 고 거제고·거제상문고
  "gyeongnam/gimhaesi": { middle: ["gayajung", "gyeongunjung-gimhaesi"], high: ["gusango", "gimhaegayago"] }, // 김해시 · 중 가야중·경운중 / 고 구산고·김해가야고
  "gyeongnam/goseonggun": { middle: ["goseongdongjung", "goseongyeojung"], high: ["goseonggo-goseonggun", "goseongjunganggo"] }, // 고성군 · 중 고성동중·고성여중 / 고 고성고·고성중앙고
  "gyeongnam/hamangun": { middle: ["gunbukjung", "daesanjung-hamangun"], high: ["gunbukgo", "myeongdeokgo-hamangun"] }, // 함안군 · 중 군북중·대산중 / 고 군북고·명덕고
  "gyeongnam/jinjusi": { middle: ["gaeyangjung", "gyeongsangsadaebujung"], high: ["gyeonghaeyeogo", "daegokgo-jinjusi"] }, // 진주시 · 중 개양중·경상사대부중 / 고 경해여고·대곡고
  "gyeongnam/miryangsi": { middle: ["dongmyeongjung-miryangsi", "muanjung"], high: ["milseonggo", "miryanggo"] }, // 밀양시 · 중 동명중·무안중 / 고 밀성고·밀양고
  "gyeongnam/namhaegun": { middle: ["kkotnaejung", "namhaeyeojung"], high: ["namhaego", "namhaejeilgo"] }, // 남해군 · 중 꽃내중·남해여중 / 고 남해고·남해제일고
  "gyeongnam/sacheonsi": { middle: ["gonmyeongjung", "gonyangjung"], high: ["gonyanggo", "sacheongo"] }, // 사천시 · 중 곤명중·곤양중 / 고 곤양고·사천고
  "gyeongnam/sancheonggun": { middle: ["gyeonghojung", "danseongjung-sancheonggun"], high: ["danseonggo", "deoksango-sancheonggun"] }, // 산청군 · 중 경호중·단성중 / 고 단성고·덕산고
  "gyeongnam/uiryeonggun": { middle: ["dogyejung-uiryeonggun", "sinbanjung"], high: ["uiryeonggo", "uiryeongyeogo"] }, // 의령군 · 중 도계중·신반중 / 고 의령고·의령여고
  "gyeongnam/yangsansi": { middle: ["gaeunjung-yangsansi", "geumsongjung"], high: ["mulgeumgo", "beomeogo"] }, // 양산시 · 중 개운중·금송중 / 고 물금고·범어고
  "incheon/donggu": { middle: ["gajwayeojung", "gajwajung"], high: ["dongsango"] }, // 동구 · 중 가좌여중·가좌중 / 고 동산고
  "incheon/ganghwagun": { middle: ["gangnamjung-ganghwagun", "gangseojung"], high: ["ganghwago", "ganghwayeogo"] }, // 강화군 · 중 강남중·강서중 / 고 강화고·강화여고
  "incheon/gyeyanggu": { middle: ["gyesanyeojung", "gyesanjung"], high: ["gyesango", "gyesanyeogo"] }, // 계양구 · 중 계산여중·계산중 / 고 계산고·계산여고
  "incheon/junggu": { middle: ["goaseongjung", "gonghangjung-junggu"], high: ["gwangseonggo-junggu", "inseongyeogo"] }, // 중구 · 중 고아성중·공항중 / 고 광성고·인성여고
  "incheon/michuholgu": { middle: ["gwangyoyeojung", "gwangyojung"], high: ["seoningo", "inmyeongyeogo"] }, // 미추홀구 · 중 관교여중·관교중 / 고 선인고·인명여고
  "incheon/namdonggu": { middle: ["ganseogyeojung", "gojanjung"], high: ["gojango-namdonggu", "dorimgo"] }, // 남동구 · 중 간석여중·고잔중 / 고 고잔고·도림고
  "incheon/ongjingun": { middle: ["daecheongjung-ongjingun", "deokjeokjung"], high: ["daecheonggo", "deokjeokgo"] }, // 옹진군 · 중 대청중·덕적중 / 고 대청고·덕적고
  "jeonbuk/gimjesi": { middle: ["geumgujung-gimjesi", "geumsanjung-gimjesi"], high: ["gimjego", "gimjeseogo"] }, // 김제시 · 중 금구중·금산중 / 고 김제고·김제서고
  "jeonbuk/gochanggun": { middle: ["gochangnamjung", "gochangbukjung"], high: ["gochanggo", "gochangbukgo"] }, // 고창군 · 중 고창남중·고창북중 / 고 고창고·고창북고
  "jeonbuk/gunsansi": { middle: ["gunsannamjung", "gunsandaeseongjung"], high: ["gunsango", "gunsandonggo"] }, // 군산시 · 중 군산남중·군산대성중 / 고 군산고·군산동고
  "jeonbuk/imsilgun": { middle: ["gwanchonjung", "samgyejung-imsilgun"], high: ["imsilgo"] }, // 임실군 · 중 관촌중·삼계중 / 고 임실고
  "jeonbuk/jeongeupsi": { middle: ["gamgokjung-jeongeupsi", "gobujung"], high: ["baeyeonggo", "seoyeongyeogo"] }, // 정읍시 · 중 감곡중·고부중 / 고 배영고·서영여고
  "jeonbuk/jeonjusideokjingu": { middle: ["girinjung-jeonjusideokjingu", "deogiljung"], high: ["yanghyeongo", "useokgo"] }, // 전주시 덕진구 · 중 기린중·덕일중 / 고 양현고·우석고
  "jeonbuk/jeonjusiwansangu": { middle: ["gonjijung", "geunyeongjung"], high: ["dongamgo", "sangsango"] }, // 전주시 완산구 · 중 곤지중·근영중 / 고 동암고·상산고
  "jeonbuk/mujugun": { middle: ["mujujung", "mupungjung"], high: ["mujugo", "seolcheongo"] }, // 무주군 · 중 무주중·무풍중 / 고 무주고·설천고
  "jeonbuk/wanjugun": { middle: ["gosanjung-wanjugun", "guijung"], high: ["wanjugo", "jeonjuyesulgo"] }, // 완주군 · 중 고산중·구이중 / 고 완주고·전주예술고
  "jeonnam/boseonggun": { middle: ["donggangjung-boseonggun", "beolgyoyeojung"], high: ["beolgyogo", "beolgyoyeogo"] }, // 보성군 · 중 동강중·벌교여중 / 고 벌교고·벌교여고
  "jeonnam/damyanggun": { middle: ["goseojung", "geumseongjung-damyanggun"], high: ["damyanggo", "changpyeonggo"] }, // 담양군 · 중 고서중·금성중 / 고 담양고·창평고
  "jeonnam/gangjingun": { middle: ["gangjinyeojung", "gangjinjung"], high: ["gangjingo", "seongjeongo"] }, // 강진군 · 중 강진여중·강진중 / 고 강진고·성전고
  "jeonnam/goheunggun": { middle: ["goheungdohwajung", "goheungyeojung"], high: ["goheunggo", "nokdonggo"] }, // 고흥군 · 중 고흥도화중·고흥여중 / 고 고흥고·녹동고
  "jeonnam/guryegun": { middle: ["guryedongjung", "guryebukjung"], high: ["guryego"] }, // 구례군 · 중 구례동중·구례북중 / 고 구례고
  "jeonnam/gwangyangsi": { middle: ["gwangyanggoryakjung", "gwangyangjecheoljung"], high: ["gwangyangyeogo", "gwangyangjecheolgo"] }, // 광양시 · 중 광양골약중·광양제철중 / 고 광양여고·광양제철고
  "jeonnam/hampyeonggun": { middle: ["sonbuljung", "singwangjung-hampyeonggun"], high: ["hampyeonggo"] }, // 함평군 · 중 손불중·신광중 / 고 함평고
  "jeonnam/hwasungun": { middle: ["neungjujung", "dogokjung-hwasungun"], high: ["neungjugo", "hwasungo"] }, // 화순군 · 중 능주중·도곡중 / 고 능주고·화순고
  "jeonnam/jangheunggun": { middle: ["gwansanjung-jangheunggun", "daedeokjung-jangheunggun"], high: ["jangheunggo"] }, // 장흥군 · 중 관산중·대덕중 / 고 장흥고
  "jeonnam/jangseonggun": { middle: ["baegamjung-jangseonggun", "samgyejung-jangseonggun"], high: ["munhyanggo", "jangseonggo-jangseonggun"] }, // 장성군 · 중 백암중·삼계중 / 고 문향고·장성고
  "jeonnam/najusi": { middle: ["gongsanjung-najusi", "geumseongjung-najusi"], high: ["najugo", "maeseonggo"] }, // 나주시 · 중 공산중·금성중 / 고 나주고·매성고
  "jeonnam/sinangun": { middle: ["gongsanjung-sinangun", "sinuijung"], high: ["dochogo", "imjago"] }, // 신안군 · 중 공산중·신의중 / 고 도초고·임자고
  "jeonnam/suncheonsi": { middle: ["geumdangjung", "naganjung"], high: ["suncheongo", "suncheonyeogo"] }, // 순천시 · 중 금당중·낙안중 / 고 순천고·순천여고
  "jeonnam/wandogun": { middle: ["gogeumjung", "gunoejung"], high: ["gogeumgo", "nohwago"] }, // 완도군 · 중 고금중·군외중 / 고 고금고·노화고
  "jeonnam/yeongamgun": { middle: ["gurimjung-yeongamgun", "geumjeongjung-yeongamgun"], high: ["samhogo", "yeongamgo"] }, // 영암군 · 중 구림중·금정중 / 고 삼호고·영암고
  "jeonnam/yeonggwanggun": { middle: ["gunnamjung-yeonggwanggun", "daemajung"], high: ["yeongsanseongjigo", "haeryonggo"] }, // 영광군 · 중 군남중·대마중 / 고 영산성지고·해룡고
  "jeonnam/yeosusi": { middle: ["gaedojung", "geomunjung"], high: ["buyeongyeogo", "yeonamgo"] }, // 여수시 · 중 개도중·거문중 / 고 부영여고·여남고
  "seoul/dobonggu": { middle: ["nogokjung", "dobongjung"], high: ["nuwongo", "seondeokgo"] }, // 도봉구 · 중 노곡중·도봉중 / 고 누원고·선덕고
  "seoul/eunpyeonggu": { middle: ["gusanjung", "daeseongjung"], high: ["daeseonggo", "dongmyeongyeogo"] }, // 은평구 · 중 구산중·대성중 / 고 대성고·동명여고
  "seoul/gangbukgu": { middle: ["gangbukjung", "beondongjung"], high: ["samgaksango", "solsaemgo"] }, // 강북구 · 중 강북중·번동중 / 고 삼각산고·솔샘고
  "seoul/gangseogu": { middle: ["gyeongseojung", "gonghangjung"], high: ["gyeongbogyeogo", "gonghanggo"] }, // 강서구 · 중 경서중·공항중 / 고 경복여고·공항고
  "seoul/geumcheongu": { middle: ["gasanjung", "nangokjung"], high: ["geumcheongo", "doksango"] }, // 금천구 · 중 가산중·난곡중 / 고 금천고·독산고
  "seoul/gwanakgu": { middle: ["gwanakjung", "gwangsinjung"], high: ["gwangsingo", "guamgo"] }, // 관악구 · 중 관악중·광신중 / 고 광신고·구암고
  "seoul/gwangjingu": { middle: ["garamjung-gwangjingu", "geonguksadaebujung"], high: ["gwangnamgo-gwangjingu", "gwangyanggo"] }, // 광진구 · 중 가람중·건국사대부중 / 고 광남고·광양고
  "seoul/jongrogu": { middle: ["daegyeongjung-jongrogu", "deokseongyeojung"], high: ["gyeongbokgo", "gyeongsingo"] }, // 종로구 · 중 대경중·덕성여중 / 고 경복고·경신고
  "seoul/junggu": { middle: ["geumhojung", "daegyeongjung-junggu"], high: ["seongdonggo", "ihwayeogo"] }, // 중구 · 중 금호중·대경중 / 고 성동고·이화여고
  "seoul/nowongu": { middle: ["gongreungjung", "gwangunjung"], high: ["nowongo", "daejingo"] }, // 노원구 · 중 공릉중·광운중 / 고 노원고·대진고
  "ulsan/namgu": { middle: ["gangnamjung-namgu", "daehyeonjung"], high: ["daehyeongo", "mugeogo"] }, // 남구 · 중 강남중·대현중 / 고 대현고·무거고
};
