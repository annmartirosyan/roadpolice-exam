(function (root) {
  const BEST_SCORE_KEY = 'varordakan_sign_game_best_v1';

  const SCENARIOS = [
    {
      id: 'stop_2_5',
      code: '2.5',
      scene: 'stop_line',
      initialSpeed: 50,
      allowed: ['brake'],
      prompt: {
        hy: 'Մոտենում եք խաչմերուկին՝ առջևում կանգ-գիծ է և 2.5 նշանը։ Ի՞նչ անել։',
        ru: 'Вы подъезжаете к перекрёстку: впереди стоп-линия и знак 2.5. Ваши действия?',
        en: 'Approaching an intersection with a stop line and sign 2.5. What do you do?',
      },
      explain: {
        hy: '2.5 «Առանց կանգառի երթևեկությունն արգելվում է» (STOP) — պարտադիր է լրիվ կանգ առնել կանգ-գծի առջև։',
        ru: '2.5 «Движение без остановки запрещено» (STOP) — обязательна полная остановка у стоп-линии.',
        en: '2.5 "STOP" — you must come to a complete stop before the stop line and yield.',
      },
    },
    {
      id: 'yield_2_4',
      code: '2.4',
      scene: 'yield_line',
      initialSpeed: 55,
      allowed: ['brake'],
      prompt: {
        hy: 'Գլխավոր ճանապարհով աջից ավտոմեքենա է մոտենում։ Ի՞նչ է պահանջում 2.4 նշանը։',
        ru: 'По главной дороге приближается машина. Что требует знак 2.4?',
        en: 'Cross traffic is approaching on the main road. What does sign 2.4 require?',
      },
      explain: {
        hy: '2.4 «Զիջեք ճանապարհը» — անհրաժեշտ է արգելակել և զիջել հատվող ճանապարհով ընթացողներին։',
        ru: '2.4 «Уступите дорогу» — необходимо притормозить и уступить дорогу пересекающему транспорту.',
        en: '2.4 "Give way" — slow down or stop and yield to traffic on the intersecting main road.',
      },
    },
    {
      id: 'ped_5_19_1',
      code: '5.19.1',
      scene: 'crosswalk',
      initialSpeed: 50,
      allowed: ['brake'],
      prompt: {
        hy: 'Հետիոտնը պատրաստվում է անցնել զեբրայով։ Ի՞նչ անել։',
        ru: 'Пешеход выходит на зебру у знака 5.19.1. Ваши действия?',
        en: 'A pedestrian is crossing at the zebra crosswalk (5.19.1). What should you do?',
      },
      explain: {
        hy: '5.19.1 «Հետիոտնային անցում» — վարորդը պարտավոր է արգելակել և զիջել անցումով անցնող հետիոտնին։',
        ru: '5.19.1 «Пешеходный переход» — водитель обязан притормозить и уступить дорогу пешеходам.',
        en: '5.19.1 "Pedestrian crossing" — slow down and yield to pedestrians on the crosswalk.',
      },
    },
    {
      id: 'rail_1_1',
      code: '1.1',
      scene: 'railway',
      initialSpeed: 60,
      allowed: ['brake'],
      prompt: {
        hy: 'Առջևում երկաթուղային գծանց է՝ ուղեփակոցն իջնում է։ Ի՞նչ անել։',
        ru: 'Впереди железнодорожный переезд, шлагбаум закрывается. Ваши действия?',
        en: 'Railway crossing ahead with barrier lowering (sign 1.1). What should you do?',
      },
      explain: {
        hy: '1.1 «Երկաթուղային գծանց` ուղեփակոցով» — արգելակեք և կանգ առեք ուղեփակոցից առնվազն 5 մ հեռու։',
        ru: '1.1 «Ж/д переезд со шлагбаумом» — остановитесь минимум за 5 м до шлагбаума.',
        en: '1.1 "Railway crossing with barrier" — brake and stop safely before the lowering barrier.',
      },
    },
    {
      id: 'speed_3_24',
      code: '3.24',
      scene: 'speed_zone',
      initialSpeed: 75,
      allowed: ['brake'],
      prompt: {
        hy: 'Ձեր արագությունը 75 կմ/ժ է, իսկ 3.24 նշանը սահմանափակում է արագությունը։ Ի՞նչ անել։',
        ru: 'Ваша скорость 75 км/ч, впереди знак ограничения скорости 3.24. Ваши действия?',
        en: 'Your speed is 75 km/h and sign 3.24 sets a lower speed limit. What do you do?',
      },
      explain: {
        hy: '3.24 «Առավելագույն արագության սահմանափակում» — արգելակեք և իջեցրեք արագությունը մինչև նշանի վրա նշված շեմը։',
        ru: '3.24 «Ограничение максимальной скорости» — снизьте скорость, чтобы не превысить предел.',
        en: '3.24 "Maximum speed limit" — decelerate to stay within the posted maximum speed.',
      },
    },
    {
      id: 'slippery_1_15',
      code: '1.15',
      scene: 'slippery',
      initialSpeed: 75,
      allowed: ['brake'],
      prompt: {
        hy: 'Արագությունը 75 կմ/ժ է, առջևում սայթաքուն ճանապարհ է (1.15)։ Ի՞նչ անել։',
        ru: 'Скорость 75 км/ч, впереди скользкая дорога (1.15). Ваши действия?',
        en: 'Speed is 75 km/h and sign 1.15 warns of a slippery road ahead. What do you do?',
      },
      explain: {
        hy: '1.15 «Սայթաքուն ճանապարհ» — սահուն նվազեցրեք արագությունը և խուսափեք կտրուկ մանևրներից։',
        ru: '1.15 «Скользкая дорога» — плавно снизьте скорость и избегайте резких манёвров.',
        en: '1.15 "Slippery road" — smoothly slow down and avoid sudden steering or hard braking.',
      },
    },
    {
      id: 'narrow_yield_2_6',
      code: '2.6',
      scene: 'narrow_bridge',
      initialSpeed: 55,
      allowed: ['brake'],
      prompt: {
        hy: 'Նեղ կամուրջ է, հանդիպակաց ավտոմեքենա է մոտենում։ Ի՞նչ է պահանջում 2.6 նշանը։',
        ru: 'Узкий мост, навстречу едет автомобиль. Что означает знак 2.6?',
        en: 'Narrow bridge ahead with an oncoming car. What does sign 2.6 mean?',
      },
      explain: {
        hy: '2.6 «Հանդիպակաց երթևեկության առավելություն» — զիջեք ճանապարհը հանդիպակաց տրանսպորտին։',
        ru: '2.6 «Преимущество встречного движения» — остановитесь и уступите встречной машине.',
        en: '2.6 "Priority for oncoming traffic" — brake and yield to the oncoming vehicle.',
      },
    },
    {
      id: 'narrow_prio_2_7',
      code: '2.7',
      scene: 'narrow_bridge',
      initialSpeed: 50,
      allowed: ['straight'],
      prompt: {
        hy: 'Նեղ հատվածում դուք ունեք 2.7 նշանը (հանդիպակաց մեքենան սպասում է)։ Ի՞նչ անել։',
        ru: 'На узком участке у вас знак 2.7 (встречная машина уступает). Ваши действия?',
        en: 'At the narrow passage you see sign 2.7 (oncoming car waits). What should you do?',
      },
      explain: {
        hy: '2.7 «Առավելություն հանդիպակաց երթևեկության նկատմամբ» — դուք ունեք առաջնահերթություն, շարունակեք ուղիղ։',
        ru: '2.7 «Преимущество перед встречным движением» — у вас приоритет, продолжайте движение прямо.',
        en: '2.7 "Priority over oncoming traffic" — you have right-of-way; proceed straight through.',
      },
    },
    {
      id: 'straight_4_1_1',
      code: '4.1.1',
      scene: 'intersection',
      initialSpeed: 50,
      allowed: ['straight'],
      prompt: {
        hy: 'Խաչմերուկի առջև տեղադրված է 4.1.1 թելադրող նշանը։ Ո՞ր ուղղությամբ գնալ։',
        ru: 'Перед перекрёстком установлен предписывающий знак 4.1.1. Куда можно ехать?',
        en: 'Mandatory sign 4.1.1 is posted before the intersection. Which way can you go?',
      },
      explain: {
        hy: '4.1.1 «Երթևեկությունն ուղիղ» — թույլատրվում է երթևեկել միայն ուղիղ։',
        ru: '4.1.1 «Движение прямо» — разрешено ехать только прямо.',
        en: '4.1.1 "Go straight" — you must proceed straight ahead only.',
      },
    },
    {
      id: 'right_4_1_2',
      code: '4.1.2',
      scene: 'intersection',
      initialSpeed: 45,
      allowed: ['right'],
      prompt: {
        hy: 'Խաչմերուկում 4.1.2 նշանն է։ Ո՞ր կողմ պետք է թեքվել։',
        ru: 'На перекрёстке знак 4.1.2. В какую сторону нужно повернуть?',
        en: 'You see mandatory sign 4.1.2 at the intersection. Which way must you turn?',
      },
      explain: {
        hy: '4.1.2 «Երթևեկությունը դեպի աջ» — թույլատրվում է շրջադարձ կատարել միայն դեպի աջ։',
        ru: '4.1.2 «Движение направо» — поворот разрешён только направо.',
        en: '4.1.2 "Turn right" — you are required to turn right here.',
      },
    },
    {
      id: 'left_4_1_3',
      code: '4.1.3',
      scene: 'intersection',
      initialSpeed: 45,
      allowed: ['left'],
      prompt: {
        hy: 'Խաչմերուկում 4.1.3 թելադրող նշանն է։ Ո՞ր ուղղությունն է ճիշտ։',
        ru: 'На перекрёстке предписывающий знак 4.1.3. Какое направление правильное?',
        en: 'Mandatory sign 4.1.3 is at the intersection. Which direction is required?',
      },
      explain: {
        hy: '4.1.3 «Երթևեկությունը դեպի ձախ» — թույլատրվում է երթևեկել միայն դեպի ձախ (և հետադարձ)։',
        ru: '4.1.3 «Движение налево» — разрешён поворот налево (и разворот).',
        en: '4.1.3 "Turn left" — you must turn left here (or make a U-turn).',
      },
    },
    {
      id: 'obs_right_4_2_1',
      code: '4.2.1',
      scene: 'obstacle_center',
      initialSpeed: 45,
      allowed: ['right'],
      prompt: {
        hy: 'Ճանապարհին վերանորոգման արգելք է՝ 4.2.1 նշանով։ Ո՞ր կողմից շրջանցել։',
        ru: 'Впереди дорожное препятствие со знаком 4.2.1. С какой стороны его объехать?',
        en: 'Roadwork obstacle ahead with sign 4.2.1. Which side should you pass it on?',
      },
      explain: {
        hy: '4.2.1 «Արգելքի շրջանցումն աջից» — սլաքը ցույց է տալիս շրջանցել աջ կողմով։',
        ru: '4.2.1 «Объезд препятствия справа» — стрелка указывает объехать препятствие справа.',
        en: '4.2.1 "Pass the obstacle on the right" — steer to the right of the barrier.',
      },
    },
    {
      id: 'obs_left_4_2_2',
      code: '4.2.2',
      scene: 'obstacle_center',
      initialSpeed: 45,
      allowed: ['left'],
      prompt: {
        hy: 'Առջևում արգելք է՝ 4.2.2 նշանով։ Ո՞ր կողմից է թույլատրվում շրջանցել։',
        ru: 'Впереди препятствие со знаком 4.2.2. С какой стороны нужно объехать?',
        en: 'Obstacle ahead marked with sign 4.2.2. Which side must you pass it on?',
      },
      explain: {
        hy: '4.2.2 «Արգելքի շրջանցումը ձախից» — սլաքը թելադրում է շրջանցել ձախ կողմով։',
        ru: '4.2.2 «Объезд препятствия слева» — стрелка предписывает объезд слева.',
        en: '4.2.2 "Pass the obstacle on the left" — steer to the left of the barrier.',
      },
    },
    {
      id: 'roundabout_4_3',
      code: '4.3',
      scene: 'roundabout',
      initialSpeed: 45,
      allowed: ['right'],
      prompt: {
        hy: 'Մոտենում եք 4.3 շրջանաձև խաչմերուկին։ Ո՞ր կողմից մտնել օղակ (աջակողմյան երթևեկություն)։',
        ru: 'Впереди круговое движение 4.3. В какую сторону въезжать на круг?',
        en: 'Approaching a roundabout (sign 4.3). Which direction do you enter the circle?',
      },
      explain: {
        hy: '4.3 «Շրջանաձև երթևեկություն» — Հայաստանում շրջան մուտք ենք գործում աջից՝ ժամսլաքի հակառակ ուղղությամբ։',
        ru: '4.3 «Круговое движение» — въезд на круг выполняется направо (против часовой стрелки).',
        en: '4.3 "Roundabout" — in right-hand traffic, enter by steering right (counter-clockwise).',
      },
    },
    {
      id: 'no_entry_3_1',
      code: '3.1',
      scene: 'intersection',
      initialSpeed: 45,
      allowed: ['left', 'right'],
      prompt: {
        hy: 'Ուղիղ փողոցի մուտքին կախված է 3.1 «Մուտքն արգելվում է» նշանը։ Ի՞նչ անել խաչմերուկում։',
        ru: 'Прямо на въезде висит «кирпич» (3.1). Что делать на перекрёстке?',
        en: 'Sign 3.1 "No entry" blocks the road straight ahead. What should you do at the junction?',
      },
      explain: {
        hy: '3.1 «Մուտքն արգելվում է» — ուղիղ մտնելն արգելված է, անհրաժեշտ է թեքվել ձախ կամ աջ։',
        ru: '3.1 «Въезд запрещён» — ехать прямо нельзя, нужно повернуть налево или направо.',
        en: '3.1 "No entry" — entering straight ahead is prohibited; turn left or right instead.',
      },
    },
    {
      id: 'no_right_3_18_1',
      code: '3.18.1',
      scene: 't_right_straight',
      initialSpeed: 50,
      allowed: ['straight'],
      prompt: {
        hy: 'Առջևում ճանապարհը գնում է ուղիղ և աջ, իսկ նշանը 3.18.1 է։ Ո՞ր ուղղությունն է թույլատրված։',
        ru: 'Дорога идёт прямо и направо, установлен знак 3.18.1. Куда можно ехать?',
        en: 'The road goes straight or right, with sign 3.18.1 posted. Which way is allowed?',
      },
      explain: {
        hy: '3.18.1 «Աջ շրջադարձն արգելվում է» — արգելում է միայն աջ շրջադարձը, ուղիղ երթևեկելը թույլատրված է։',
        ru: '3.18.1 «Поворот направо запрещён» — запрещает только поворот направо, прямо ехать можно.',
        en: '3.18.1 "No right turn" — only turning right is banned; going straight is allowed.',
      },
    },
    {
      id: 'no_left_3_18_2',
      code: '3.18.2',
      scene: 't_left_straight',
      initialSpeed: 50,
      allowed: ['straight'],
      prompt: {
        hy: 'Առջևում ճանապարհը գնում է ուղիղ և ձախ, տեղադրված է 3.18.2 նշանը։ Ո՞ր ուղղությամբ գնալ։',
        ru: 'Дорога идёт прямо и налево, установлен знак 3.18.2. Куда можно ехать?',
        en: 'The road goes straight or left, with sign 3.18.2 posted. Which way should you go?',
      },
      explain: {
        hy: '3.18.2 «Ձախ շրջադարձն արգելվում է» — ձախ թեքվել չի կարելի, շարունակեք ուղիղ։',
        ru: '3.18.2 «Поворот налево запрещён» — поворот налево запрещён, поезжайте прямо.',
        en: '3.18.2 "No left turn" — turning left is prohibited; keep going straight.',
      },
    },
    {
      id: 'no_overtake_3_20',
      code: '3.20',
      scene: 'slow_car',
      initialSpeed: 50,
      allowed: ['straight'],
      prompt: {
        hy: 'Առջևում դանդաղ բեռնատար է, իսկ ճանապարհին 3.20 նշանն է։ Վազանցե՞լ ձախից, թե՞ մնալ գոտում։',
        ru: 'Впереди медленный грузовик и знак 3.20. Обогнать слева или остаться в своей полосе?',
        en: 'A slow truck is ahead and sign 3.20 is posted. Overtake left or stay straight in lane?',
      },
      explain: {
        hy: '3.20 «Վազանցն արգելվում է» — վազանցելն արգելված է, մնացեք Ձեր գոտում (ուղիղ)։',
        ru: '3.20 «Обгон запрещён» — обгонять нельзя, оставайтесь прямо в своей полосе.',
        en: '3.20 "No overtaking" — overtaking is prohibited; remain straight in your lane.',
      },
    },
    {
      id: 'no_stop_3_27',
      code: '3.27',
      scene: 'no_stop_curb',
      initialSpeed: 45,
      allowed: ['straight'],
      prompt: {
        hy: 'Ուզում էիք կանգ առնել աջ եզրին, բայց տեսնում եք 3.27 նշանը։ Ի՞նչ անել։',
        ru: 'Хотели остановиться у правого края, но видите знак 3.27. Ваши действия?',
        en: 'You wanted to stop on the right, but you spot sign 3.27. What should you do?',
      },
      explain: {
        hy: '3.27 «Կանգառն արգելվում է» — այստեղ կանգ առնելն ու կայանելն արգելված է, շարունակեք երթևեկությունը ուղիղ։',
        ru: '3.27 «Остановка запрещена» — останавливаться и парковаться здесь нельзя, поезжайте прямо.',
        en: '3.27 "No stopping" — stopping and parking are both banned here; keep driving straight.',
      },
    },
    {
      id: 'parking_6_4',
      code: '6.4',
      scene: 'parking_bay',
      initialSpeed: 35,
      allowed: ['right'],
      prompt: {
        hy: 'Հասել եք նշանակման վայր և տեսնում եք 6.4 նշանը՝ աջ կողմի գրպանիկում։ Ի՞նչ անել։',
        ru: 'Вы прибыли на место и видите знак 6.4 у парковочного кармана справа. Ваши действия?',
        en: 'You arrived and see sign 6.4 by the parking bay on the right. What do you do?',
      },
      explain: {
        hy: '6.4 «Կայանման տեղ» — թեքվեք դեպի աջ գրպանիկը և անվտանգ կայանեք մեքենան։',
        ru: '6.4 «Место стоянки» — сверните направо в парковочный карман и припаркуйтесь.',
        en: '6.4 "Parking place" — steer right into the designated parking bay.',
      },
    },
  ];

  const UI_TEXT = {
    hy: {
      title: '🚗 Ճանապարհային խաղ · Վարիր և կարդա նշանները',
      subtitle: 'Ավտոմեքենան շարժվում է ճանապարհով․ ընտրիր ճիշտ գործողությունը՝ ըստ մոտեցող նշանի։',
      modeArcade: '⏱️ Արագ խաղ (8 վրկ)',
      modeRelaxed: '🎓 Հանգիստ ուսուցում',
      newTrip: '🔄 Նոր երթուղի',
      scoreLabel: 'Միավոր',
      bestLabel: 'Ռեկորդ',
      roundLabel: 'Նշան',
      speedUnit: 'կմ/ժ',
      btnLeft: '⬅️ Ձախ',
      btnStraight: '⬆️ Ուղիղ',
      btnRight: '➡️ Աջ',
      btnBrake: '🛑 Արգելակել',
      kbdHint: 'Ստեղներ՝ ← ↑ → ↓ կամ Space',
      soundOn: '🔊 Ձայն',
      soundOff: '🔇 Անջատ',
      correctTitle: 'Ճիշտ մանևր',
      wrongTitle: 'Սխալ գործողություն',
      timeoutTitle: 'Ժամանակը լրացավ',
      nextBtn: 'Շարունակել երթուղին →',
      finishWinTitle: '🏆 Գերազանց վարում։ Երթուղին հաջողությամբ ավարտված է։',
      finishLoseTitle: '💥 Երթուղին ավարտվեց (0 սիրտ մնաց)',
      finishSummary: (score, ok, total, best) =>
        `Հավաքած միավոր՝ <strong>${score}</strong> · Ճիշտ նշաններ՝ <strong>${ok} / ${total}</strong> · Ռեկորդ՝ <strong>${best}</strong>`,
      playAgain: '🚗 Խաղալ նորից',
      studySigns: '🚸 Բոլոր նշանները',
      signFallback: 'Նշան',
    },
    ru: {
      title: '🚗 Дорожная игра · Веди машину по знакам',
      subtitle: 'Машина едет по дороге: выбери правильный манёвр по приближающемуся знаку.',
      modeArcade: '⏱️ Аркада (8 сек)',
      modeRelaxed: '🎓 Без таймера',
      newTrip: '🔄 Новый маршрут',
      scoreLabel: 'Очки',
      bestLabel: 'Рекорд',
      roundLabel: 'Знак',
      speedUnit: 'км/ч',
      btnLeft: '⬅️ Налево',
      btnStraight: '⬆️ Прямо',
      btnRight: '➡️ Направо',
      btnBrake: '🛑 Тормоз',
      kbdHint: 'Клавиши: ← ↑ → ↓ или Пробел',
      soundOn: '🔊 Звук',
      soundOff: '🔇 Тихо',
      correctTitle: 'Верный манёвр!',
      wrongTitle: 'Нарушение ПДД',
      timeoutTitle: 'Время вышло',
      nextBtn: 'Ехать дальше →',
      finishWinTitle: '🏆 Отличная поездка! Маршрут пройден без аварий.',
      finishLoseTitle: '💥 Поездка окончена (закончились жизни)',
      finishSummary: (score, ok, total, best) =>
        `Ваш счёт: <strong>${score}</strong> · Верных знаков: <strong>${ok} / ${total}</strong> · Рекорд: <strong>${best}</strong>`,
      playAgain: '🚗 Играть снова',
      studySigns: '🚸 Все знаки',
      signFallback: 'Знак',
    },
    en: {
      title: '🚗 Road Sign Drive · Steer by the Signs',
      subtitle: 'Your car is driving down the road — pick the right maneuver for each approaching sign.',
      modeArcade: '⏱️ Arcade (8s)',
      modeRelaxed: '🎓 Relaxed Pace',
      newTrip: '🔄 New Trip',
      scoreLabel: 'Score',
      bestLabel: 'Best',
      roundLabel: 'Sign',
      speedUnit: 'km/h',
      btnLeft: '⬅️ Left',
      btnStraight: '⬆️ Straight',
      btnRight: '➡️ Right',
      btnBrake: '🛑 Brake / Yield',
      kbdHint: 'Keys: ← ↑ → ↓ or Space',
      soundOn: '🔊 Sound',
      soundOff: '🔇 Muted',
      correctTitle: 'Great Driving!',
      wrongTitle: 'Traffic Violation',
      timeoutTitle: 'Time Ran Out',
      nextBtn: 'Continue Driving →',
      finishWinTitle: '🏆 Smooth Drive! Route completed!',
      finishLoseTitle: '💥 Trip Over (out of hearts)',
      finishSummary: (score, ok, total, best) =>
        `Score: <strong>${score}</strong> · Signs passed: <strong>${ok} / ${total}</strong> · Best: <strong>${best}</strong>`,
      playAgain: '🚗 Play Again',
      studySigns: '🚸 Browse All Signs',
      signFallback: 'Sign',
    },
  };

  function shuffle(arr) {
    const out = arr.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  function loadBestScore() {
    try {
      const raw = window.localStorage.getItem(BEST_SCORE_KEY);
      const n = Number(raw);
      return Number.isFinite(n) && n > 0 ? Math.round(n) : 0;
    } catch (_) {
      return 0;
    }
  }

  function saveBestScore(n) {
    try {
      window.localStorage.setItem(BEST_SCORE_KEY, String(Math.round(n)));
    } catch (_) {}
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  let activeCleanup = null;

  function unmount() {
    if (typeof activeCleanup === 'function') {
      activeCleanup();
      activeCleanup = null;
    }
  }

  function mount(opts) {
    unmount();
    const { container, getLang, signsByCode, getSignText, navigateTo } = opts;
    if (!container) return;

    const imageCache = {};
    for (const sc of SCENARIOS) {
      const signObj = signsByCode[sc.code];
      if (signObj && signObj.image && !imageCache[sc.code]) {
        const img = new Image();
        img.src = signObj.image;
        imageCache[sc.code] = img;
      }
    }

    let audioCtx = null;
    function playTone(ok) {
      if (!game.sound) return;
      try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        if (!audioCtx) audioCtx = new Ctx();
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = ok ? 'triangle' : 'sawtooth';
        osc.frequency.setValueAtTime(ok ? 523.25 : 196, now);
        if (ok) osc.frequency.exponentialRampToValueAtTime(784, now + 0.14);
        else osc.frequency.exponentialRampToValueAtTime(130, now + 0.22);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + (ok ? 0.22 : 0.26));
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + (ok ? 0.24 : 0.28));
      } catch (_) {}
    }

    const ROUND_COUNT = 10;
    const ARCADE_TIME_SEC = 8.0;

    const game = {
      mode: 'arcade', // 'arcade' | 'relaxed'
      sound: true,
      deck: [],
      roundIdx: 0,
      hearts: 3,
      score: 0,
      bestScore: loadBestScore(),
      streak: 0,
      correctCount: 0,
      phase: 'driving', // 'driving' | 'animating' | 'feedback' | 'finished'
      feedback: null, // { ok, timeout, action, title, explain }
      // Canvas animation state
      roadScroll: 0,
      propProgress: 0.08, // 0 (horizon) -> 1 (car line)
      timeLeft: ARCADE_TIME_SEC,
      carX: 0, // -1 left lane, 0 right lane, +1 far right bay
      carY: 0, // offset
      carAngle: 0,
      carSpeed: 50,
      targetAction: null,
      animProgress: 0,
      blinkTimer: 0,
      lastFrameMs: 0,
    };

    function currentScenario() {
      return game.deck[game.roundIdx] || SCENARIOS[0];
    }

    function startNewTrip() {
      game.deck = shuffle(SCENARIOS).slice(0, ROUND_COUNT);
      game.roundIdx = 0;
      game.hearts = 3;
      game.score = 0;
      game.streak = 0;
      game.correctCount = 0;
      setupRound();
    }

    function setupRound() {
      const sc = currentScenario();
      game.phase = 'driving';
      game.feedback = null;
      game.propProgress = 0.08;
      game.timeLeft = ARCADE_TIME_SEC;
      game.carX = 0;
      game.carY = 0;
      game.carAngle = 0;
      game.carSpeed = sc.initialSpeed || 50;
      game.targetAction = null;
      game.animProgress = 0;
      renderShell();
    }

    function commitAction(action, timedOut = false) {
      if (game.phase !== 'driving') return;
      const sc = currentScenario();
      const ok = !timedOut && sc.allowed.includes(action);
      game.phase = 'animating';
      game.targetAction = timedOut ? 'straight' : action;
      game.animProgress = 0;

      let pts = 0;
      if (ok) {
        game.streak += 1;
        game.correctCount += 1;
        const speedBonus = game.mode === 'arcade' ? Math.round(game.timeLeft * 6) : 0;
        const streakBonus = (game.streak - 1) * 20;
        pts = 100 + speedBonus + streakBonus;
        game.score += pts;
        if (game.score > game.bestScore) {
          game.bestScore = game.score;
          saveBestScore(game.bestScore);
        }
      } else {
        game.streak = 0;
        game.hearts = Math.max(0, game.hearts - 1);
      }

      playTone(ok);
      const lang = getLang();
      const ui = UI_TEXT[lang] || UI_TEXT.hy;
      game.feedback = {
        ok,
        timeout: timedOut,
        action,
        pts,
        title: ok ? ui.correctTitle : timedOut ? ui.timeoutTitle : ui.wrongTitle,
        explain: sc.explain[lang] || sc.explain.hy,
      };
      updateHud();
    }

    function advanceAfterFeedback() {
      if (game.hearts <= 0 || game.roundIdx + 1 >= game.deck.length) {
        game.phase = 'finished';
        renderShell();
        return;
      }
      game.roundIdx += 1;
      setupRound();
    }

    let canvasEl = null;
    let ctx = null;
    let rafId = 0;
    let destroyed = false;

    function renderShell() {
      const lang = getLang();
      const ui = UI_TEXT[lang] || UI_TEXT.hy;
      const sc = currentScenario();
      const signObj = signsByCode[sc.code];
      const signLoc = signObj ? getSignText(signObj) : { title: `${ui.signFallback} ${sc.code}`, description: '' };

      if (game.phase === 'finished') {
        const won = game.hearts > 0;
        container.innerHTML = `
          <div class="card game-shell">
            <div class="toolbar">
              <div class="toolbar-group">
                <strong>${escapeHtml(ui.title)}</strong>
              </div>
              <div class="toolbar-group">
                <button type="button" class="btn btn-sm" id="btn-game-to-signs">${escapeHtml(ui.studySigns)}</button>
              </div>
            </div>
            <div class="empty-state" style="padding: 24px 12px;">
              <div class="pill-tag ${won ? 'success' : 'danger'}" style="margin-bottom: 10px;">
                ${'❤️'.repeat(game.hearts)}${'🤍'.repeat(3 - game.hearts)}
              </div>
              <h2 style="margin-top: 6px;">${escapeHtml(won ? ui.finishWinTitle : ui.finishLoseTitle)}</h2>
              <p style="font-size: 16px; color: var(--text);">
                ${ui.finishSummary(game.score, game.correctCount, game.deck.length, game.bestScore)}
              </p>
              <div class="toolbar-group" style="justify-content: center; margin-top: 16px;">
                <button type="button" class="btn btn-primary" id="btn-game-play-again">${escapeHtml(ui.playAgain)}</button>
                <button type="button" class="btn" id="btn-game-to-signs-2">${escapeHtml(ui.studySigns)}</button>
              </div>
            </div>
          </div>
        `;
        container.querySelector('#btn-game-play-again')?.addEventListener('click', startNewTrip);
        container.querySelector('#btn-game-to-signs')?.addEventListener('click', () => navigateTo('signs', getLang()));
        container.querySelector('#btn-game-to-signs-2')?.addEventListener('click', () => navigateTo('signs', getLang()));
        return;
      }

      container.innerHTML = `
        <div class="card game-shell">
          <div class="toolbar" style="margin-bottom: 10px;">
            <div>
              <strong style="font-size: 17px;">${escapeHtml(ui.title)}</strong>
              <p style="margin: 2px 0 0; font-size: 13px; color: var(--text-muted);">${escapeHtml(ui.subtitle)}</p>
            </div>
            <div class="toolbar-group">
              <button type="button" class="sign-cat-pill ${game.mode === 'arcade' ? 'active' : ''}" data-game-mode="arcade">${escapeHtml(ui.modeArcade)}</button>
              <button type="button" class="sign-cat-pill ${game.mode === 'relaxed' ? 'active' : ''}" data-game-mode="relaxed">${escapeHtml(ui.modeRelaxed)}</button>
              <button type="button" class="btn btn-sm" id="btn-game-sound">${escapeHtml(game.sound ? ui.soundOn : ui.soundOff)}</button>
              <button type="button" class="btn btn-sm" id="btn-game-restart">${escapeHtml(ui.newTrip)}</button>
            </div>
          </div>

          <div class="game-hud" id="game-hud">
            <span class="pill-tag" id="hud-round"></span>
            <span class="pill-tag" id="hud-hearts"></span>
            <span class="pill-tag success" id="hud-score"></span>
            <span class="pill-tag" id="hud-speed"></span>
            <span class="pill-tag" id="hud-best"></span>
          </div>

          <div class="game-stage">
            <div class="game-canvas-wrap">
              <canvas id="game-road-canvas" width="720" height="390"></canvas>
              <div class="game-timer-bar" id="game-timer-wrap" ${game.mode === 'relaxed' ? 'hidden' : ''}>
                <div class="game-timer-fill" id="game-timer-fill"></div>
              </div>
              <div class="game-overlay-feedback" id="game-feedback-overlay" hidden></div>
            </div>

            <aside class="game-sign-card">
              ${
                signObj && signObj.image
                  ? `<img class="game-sign-img" src="${escapeHtml(signObj.image)}" alt="${escapeHtml(signLoc.title)}" />`
                  : ''
              }
              <div class="game-sign-info">
                <span class="pill-tag" style="margin-bottom: 6px;">${escapeHtml(sc.code)}</span>
                <p class="game-prompt-text">${escapeHtml(sc.prompt[lang] || sc.prompt.hy)}</p>
              </div>
            </aside>
          </div>

          <div class="game-controls" id="game-controls">
            <button type="button" class="btn game-ctrl-btn" data-game-act="left">${escapeHtml(ui.btnLeft)}</button>
            <button type="button" class="btn game-ctrl-btn" data-game-act="straight">${escapeHtml(ui.btnStraight)}</button>
            <button type="button" class="btn game-ctrl-btn" data-game-act="right">${escapeHtml(ui.btnRight)}</button>
            <button type="button" class="btn game-ctrl-btn game-ctrl-brake" data-game-act="brake">${escapeHtml(ui.btnBrake)}</button>
          </div>
          <div style="text-align: center; margin-top: 8px; font-size: 12px; color: var(--text-muted);">
            ${escapeHtml(ui.kbdHint)}
          </div>
        </div>
      `;

      canvasEl = document.getElementById('game-road-canvas');
      ctx = canvasEl ? canvasEl.getContext('2d') : null;

      container.querySelectorAll('[data-game-mode]').forEach((btn) => {
        btn.addEventListener('click', () => {
          game.mode = btn.dataset.gameMode;
          setupRound();
        });
      });

      document.getElementById('btn-game-sound')?.addEventListener('click', () => {
        game.sound = !game.sound;
        const btn = document.getElementById('btn-game-sound');
        if (btn) btn.textContent = game.sound ? ui.soundOn : ui.soundOff;
      });

      document.getElementById('btn-game-restart')?.addEventListener('click', startNewTrip);

      container.querySelectorAll('[data-game-act]').forEach((btn) => {
        btn.addEventListener('click', () => commitAction(btn.dataset.gameAct, false));
      });

      updateHud();
    }

    function updateHud() {
      const lang = getLang();
      const ui = UI_TEXT[lang] || UI_TEXT.hy;
      const rEl = document.getElementById('hud-round');
      const hEl = document.getElementById('hud-hearts');
      const sEl = document.getElementById('hud-score');
      const spEl = document.getElementById('hud-speed');
      const bEl = document.getElementById('hud-best');
      const tFill = document.getElementById('game-timer-fill');
      const overlay = document.getElementById('game-feedback-overlay');

      if (rEl) rEl.textContent = `${ui.roundLabel} ${game.roundIdx + 1} / ${game.deck.length}`;
      if (hEl) hEl.textContent = `${'❤️'.repeat(game.hearts)}${'🤍'.repeat(3 - game.hearts)}`;
      if (sEl) sEl.textContent = `${ui.scoreLabel}: ${game.score}${game.streak > 1 ? ` (🔥x${game.streak})` : ''}`;
      if (spEl) spEl.textContent = `${Math.round(game.carSpeed)} ${ui.speedUnit}`;
      if (bEl) bEl.textContent = `${ui.bestLabel}: ${game.bestScore}`;
      if (tFill && game.mode === 'arcade') {
        const pct = Math.max(0, Math.min(100, (game.timeLeft / ARCADE_TIME_SEC) * 100));
        tFill.style.width = `${pct}%`;
        tFill.style.background = pct < 30 ? '#dc2626' : pct < 60 ? '#f59e0b' : '#16a34a';
      }

      const ctrlBtns = container.querySelectorAll('[data-game-act]');
      ctrlBtns.forEach((b) => {
        b.disabled = game.phase !== 'driving';
      });

      if (overlay) {
        if (game.phase === 'feedback' && game.feedback) {
          overlay.hidden = false;
          overlay.innerHTML = `
            <div class="game-fb-card ${game.feedback.ok ? 'ok' : 'bad'}">
              <div class="game-fb-title">
                ${game.feedback.ok ? '✓' : '✕'} ${escapeHtml(game.feedback.title)}
                ${game.feedback.ok ? `<span class="pill-tag success">+${game.feedback.pts}</span>` : ''}
              </div>
              <p class="game-fb-desc">${escapeHtml(game.feedback.explain)}</p>
              <button type="button" class="btn btn-primary" id="btn-game-next-round">${escapeHtml(ui.nextBtn)}</button>
            </div>
          `;
          document.getElementById('btn-game-next-round')?.addEventListener('click', advanceAfterFeedback);
        } else {
          overlay.hidden = true;
          overlay.innerHTML = '';
        }
      }
    }

    function drawRoadScene(dt) {
      if (!ctx || !canvasEl) return;
      const W = canvasEl.width;
      const H = canvasEl.height;
      const sc = currentScenario();

      // Update motion
      game.blinkTimer += dt;
      if (game.phase === 'driving') {
        const pxPerSec = game.carSpeed * 3.4;
        game.roadScroll = (game.roadScroll + pxPerSec * dt) % 80;
        if (game.mode === 'arcade') {
          game.timeLeft = Math.max(0, game.timeLeft - dt);
          game.propProgress = 0.08 + (1 - game.timeLeft / ARCADE_TIME_SEC) * 0.62;
          if (game.timeLeft <= 0) {
            commitAction('straight', true);
          }
        } else {
          // Gently glide up to decision zone (0.48) and hold steady
          if (game.propProgress < 0.48) {
            game.propProgress = Math.min(0.48, game.propProgress + dt * 0.25);
          }
        }
      } else if (game.phase === 'animating') {
        game.animProgress = Math.min(1, game.animProgress + dt * 1.45);
        const p = game.animProgress;
        const act = game.targetAction;
        if (act === 'brake') {
          game.carSpeed = Math.max(0, (sc.initialSpeed || 50) * (1 - p * 0.92));
          game.roadScroll = (game.roadScroll + game.carSpeed * 3.2 * dt) % 80;
          game.propProgress = Math.min(0.76, game.propProgress + dt * 0.24);
        } else if (act === 'left') {
          game.roadScroll = (game.roadScroll + game.carSpeed * 3.2 * dt) % 80;
          game.propProgress = Math.min(0.9, game.propProgress + dt * 0.42);
          if (sc.scene === 'obstacle_center') {
            game.carX = -Math.sin(p * Math.PI) * 0.95;
            game.carAngle = -Math.sin(p * Math.PI * 2) * 0.16;
          } else {
            game.carX = -p * 1.35;
            game.carY = -p * 34;
            game.carAngle = -p * 0.65;
          }
        } else if (act === 'right') {
          game.roadScroll = (game.roadScroll + game.carSpeed * 3.2 * dt) % 80;
          game.propProgress = Math.min(0.9, game.propProgress + dt * 0.42);
          if (sc.scene === 'obstacle_center') {
            game.carX = Math.sin(p * Math.PI) * 0.45;
            game.carAngle = Math.sin(p * Math.PI * 2) * 0.14;
          } else if (sc.scene === 'parking_bay') {
            game.carX = p * 1.05;
            game.carAngle = Math.sin(p * Math.PI) * 0.25;
            game.carSpeed = Math.max(0, 35 * (1 - p));
          } else {
            game.carX = p * 1.35;
            game.carY = -p * 34;
            game.carAngle = p * 0.65;
          }
        } else {
          // straight
          game.roadScroll = (game.roadScroll + game.carSpeed * 3.8 * dt) % 80;
          game.propProgress = Math.min(1.05, game.propProgress + dt * 0.52);
          game.carY = -Math.sin(p * Math.PI) * 14;
        }
        if (game.animProgress >= 1) {
          game.phase = 'feedback';
          updateHud();
        }
      }

      // Sky & grass background
      ctx.fillStyle = '#dcfce7';
      ctx.fillRect(0, 0, W, H);

      // Side grass bands
      ctx.fillStyle = '#86efac';
      ctx.fillRect(0, 0, 170, H);
      ctx.fillRect(W - 170, 0, 170, H);

      // Asphalt road
      const roadX = 180;
      const roadW = 360;
      ctx.fillStyle = '#334155';
      ctx.fillRect(roadX, 0, roadW, H);

      // Road shoulders
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(roadX, 0, 6, H);
      ctx.fillRect(roadX + roadW - 6, 0, 6, H);

      // Moving trees on grass
      for (let i = -1; i < 6; i++) {
        const ty = ((i * 95 + game.roadScroll * 1.2) % (H + 95)) - 45;
        drawTree(ctx, 75, ty);
        drawTree(ctx, W - 75, ty + 45);
      }

      // Scene-specific road geometry anchored around propY
      const propY = 40 + game.propProgress * 225;
      const centerX = W / 2;

      // Dashed center line
      ctx.strokeStyle = sc.scene === 'slow_car' ? '#f8fafc' : '#f1f5f9';
      ctx.lineWidth = 5;
      ctx.setLineDash([28, 22]);
      ctx.lineDashOffset = -game.roadScroll;
      ctx.beginPath();
      ctx.moveTo(centerX, 0);
      ctx.lineTo(centerX, H);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw scene props
      if (sc.scene === 'intersection' || sc.scene === 'stop_line' || sc.scene === 'yield_line') {
        ctx.fillStyle = '#334155';
        ctx.fillRect(0, propY - 52, W, 104);
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(0, propY - 52, roadX, 5);
        ctx.fillRect(roadX + roadW, propY - 52, W - (roadX + roadW), 5);
        ctx.fillRect(0, propY + 47, roadX, 5);
        ctx.fillRect(roadX + roadW, propY + 47, W - (roadX + roadW), 5);
        if (sc.scene === 'stop_line') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(centerX + 8, propY + 46, roadW / 2 - 18, 7);
        }
        if (sc.scene === 'yield_line') {
          ctx.fillStyle = '#ffffff';
          for (let tx = centerX + 18; tx < roadX + roadW - 20; tx += 28) {
            ctx.beginPath();
            ctx.moveTo(tx, propY + 45);
            ctx.lineTo(tx + 14, propY + 45);
            ctx.lineTo(tx + 7, propY + 57);
            ctx.closePath();
            ctx.fill();
          }
          // Cross car coming from left
          drawOtherCar(ctx, 120 + Math.sin(game.blinkTimer * 2) * 30, propY + 12, '#ef4444', Math.PI / 2);
        }
      } else if (sc.scene === 't_right_straight') {
        ctx.fillStyle = '#334155';
        ctx.fillRect(centerX, propY - 50, W - centerX, 100);
      } else if (sc.scene === 't_left_straight') {
        ctx.fillStyle = '#334155';
        ctx.fillRect(0, propY - 50, centerX, 100);
      } else if (sc.scene === 'roundabout') {
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.arc(centerX, propY - 10, 140, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(centerX, propY - 10, 56, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.stroke();
      } else if (sc.scene === 'crosswalk') {
        ctx.fillStyle = '#ffffff';
        for (let sx = roadX + 18; sx < roadX + roadW - 24; sx += 34) {
          ctx.fillRect(sx, propY - 16, 18, 42);
        }
        // Pedestrian walking across
        const pedX = roadX + 90 + ((game.blinkTimer * 55) % 180);
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(pedX, propY + 4, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(pedX, propY + 4, 5, 0, Math.PI * 2);
        ctx.fill();
      } else if (sc.scene === 'railway') {
        ctx.fillStyle = '#78350f';
        ctx.fillRect(0, propY - 14, W, 28);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(0, propY - 10, W, 5);
        ctx.fillRect(0, propY + 5, W, 5);
        // Red & white gate
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(roadX + 10, propY + 22, roadW - 20, 8);
        ctx.fillStyle = '#ffffff';
        for (let gx = roadX + 26; gx < roadX + roadW - 28; gx += 44) {
          ctx.fillRect(gx, propY + 22, 20, 8);
        }
      } else if (sc.scene === 'obstacle_center') {
        // Barrier in right lane ahead
        const bx = centerX + 55;
        ctx.fillStyle = '#f97316';
        ctx.fillRect(bx - 38, propY - 12, 76, 20);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(bx - 22, propY - 12, 16, 20);
        ctx.fillRect(bx + 8, propY - 12, 16, 20);
      } else if (sc.scene === 'slow_car') {
        // Slow yellow truck ahead in right lane
        drawTruck(ctx, centerX + 78, propY + 18);
      } else if (sc.scene === 'narrow_bridge') {
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(roadX, propY - 48, 86, 96);
        ctx.fillRect(roadX + roadW - 86, propY - 48, 86, 96);
        drawOtherCar(ctx, centerX, propY - 26, '#e11d48', Math.PI);
      } else if (sc.scene === 'slippery') {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.38)';
        ctx.beginPath();
        ctx.ellipse(centerX + 60, propY + 8, 72, 26, 0.2, 0, Math.PI * 2);
        ctx.fill();
      } else if (sc.scene === 'no_stop_curb') {
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(roadX + roadW - 14, propY - 70, 12, 140);
      } else if (sc.scene === 'parking_bay') {
        ctx.fillStyle = '#334155';
        ctx.fillRect(roadX + roadW, propY - 48, 72, 96);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.strokeRect(roadX + roadW + 4, propY - 44, 62, 88);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 26px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('P', roadX + roadW + 35, propY + 9);
      }

      // Roadside Signpost (scales up slightly as it approaches)
      const signScale = 0.65 + game.propProgress * 0.45;
      const postX = roadX + roadW + 52;
      const postY = propY + 10;
      ctx.fillStyle = '#64748b';
      ctx.fillRect(postX - 3, postY, 6, 36 * signScale);
      const signSize = 54 * signScale;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(postX, postY, signSize * 0.56, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.stroke();

      const img = imageCache[sc.code];
      if (img && img.complete && img.naturalWidth > 0) {
        const iw = img.naturalWidth;
        const ih = img.naturalHeight;
        const ratio = Math.min(signSize / iw, signSize / ih);
        const dw = iw * ratio;
        const dh = ih * ratio;
        ctx.drawImage(img, postX - dw / 2, postY - dh / 2, dw, dh);
      }

      // Draw Player Car
      const baseCarX = centerX + 82 + game.carX * 92;
      const baseCarY = H - 72 + game.carY;
      const braking = game.targetAction === 'brake' && game.phase !== 'driving';
      const blinkSide =
        game.phase === 'animating' && (game.targetAction === 'left' || game.targetAction === 'right')
          ? game.targetAction
          : null;
      drawPlayerCar(ctx, baseCarX, baseCarY, game.carAngle, braking, blinkSide, Math.floor(game.blinkTimer * 6) % 2 === 0);

      // Update live timer fill & speed in HUD
      const tFill = document.getElementById('game-timer-fill');
      if (tFill && game.mode === 'arcade' && game.phase === 'driving') {
        const pct = Math.max(0, Math.min(100, (game.timeLeft / ARCADE_TIME_SEC) * 100));
        tFill.style.width = `${pct}%`;
        tFill.style.background = pct < 30 ? '#dc2626' : pct < 60 ? '#f59e0b' : '#16a34a';
      }
      const spEl = document.getElementById('hud-speed');
      if (spEl) {
        const ui = UI_TEXT[getLang()] || UI_TEXT.hy;
        spEl.textContent = `${Math.round(game.carSpeed)} ${ui.speedUnit}`;
      }
    }

    function drawTree(c, x, y) {
      c.fillStyle = '#15803d';
      c.beginPath();
      c.arc(x, y, 22, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#22c55e';
      c.beginPath();
      c.arc(x - 5, y - 5, 14, 0, Math.PI * 2);
      c.fill();
    }

    function drawTruck(c, x, y) {
      c.save();
      c.translate(x, y);
      c.fillStyle = 'rgba(15,23,42,0.28)';
      c.fillRect(-21, -34, 46, 74);
      c.fillStyle = '#f59e0b';
      c.fillRect(-22, -16, 44, 52);
      c.fillStyle = '#fbbf24';
      c.fillRect(-20, -36, 40, 20);
      c.fillStyle = '#1e293b';
      c.fillRect(-16, -32, 32, 8);
      c.restore();
    }

    function drawOtherCar(c, x, y, color, angle) {
      c.save();
      c.translate(x, y);
      c.rotate(angle || 0);
      c.fillStyle = 'rgba(15,23,42,0.25)';
      c.fillRect(-17, -28, 36, 58);
      c.fillStyle = color;
      c.beginPath();
      c.roundRect(-18, -30, 36, 58, 9);
      c.fill();
      c.fillStyle = '#1e293b';
      c.fillRect(-13, -14, 26, 16);
      c.restore();
    }

    function drawPlayerCar(c, x, y, angle, braking, blinkSide, blinkOn) {
      c.save();
      c.translate(x, y);
      c.rotate(angle || 0);

      // Headlight beams
      const grad = c.createLinearGradient(0, -34, 0, -95);
      grad.addColorStop(0, 'rgba(254, 240, 138, 0.42)');
      grad.addColorStop(1, 'rgba(254, 240, 138, 0)');
      c.fillStyle = grad;
      c.beginPath();
      c.moveTo(-16, -32);
      c.lineTo(-32, -95);
      c.lineTo(32, -95);
      c.lineTo(16, -32);
      c.closePath();
      c.fill();

      // Shadow
      c.fillStyle = 'rgba(15, 23, 42, 0.35)';
      c.beginPath();
      c.roundRect(-19, -32, 42, 68, 11);
      c.fill();

      // Car body
      c.fillStyle = '#2563eb';
      c.beginPath();
      c.roundRect(-20, -34, 40, 68, 10);
      c.fill();

      // Roof & windshield
      c.fillStyle = '#1e293b';
      c.beginPath();
      c.roundRect(-15, -16, 30, 34, 6);
      c.fill();
      c.fillStyle = '#60a5fa';
      c.beginPath();
      c.roundRect(-13, -6, 26, 18, 4);
      c.fill();

      // Headlights
      c.fillStyle = '#fef08a';
      c.fillRect(-16, -35, 8, 4);
      c.fillRect(8, -35, 8, 4);

      // Brake lights
      c.fillStyle = braking ? '#ff2d2d' : '#991b1b';
      c.fillRect(-16, 31, 9, 4);
      c.fillRect(7, 31, 9, 4);

      // Turn blinkers
      if (blinkSide && blinkOn) {
        c.fillStyle = '#f59e0b';
        if (blinkSide === 'left') {
          c.fillRect(-21, -30, 4, 8);
          c.fillRect(-21, 22, 4, 8);
        } else if (blinkSide === 'right') {
          c.fillRect(17, -30, 4, 8);
          c.fillRect(17, 22, 4, 8);
        }
      }

      c.restore();
    }

    function loop(ts) {
      if (destroyed) return;
      if (!game.lastFrameMs) game.lastFrameMs = ts;
      const dt = Math.min(0.06, Math.max(0.001, (ts - game.lastFrameMs) / 1000));
      game.lastFrameMs = ts;
      if (game.phase === 'driving' || game.phase === 'animating') {
        drawRoadScene(dt);
      }
      rafId = window.requestAnimationFrame(loop);
    }

    function onKeyDown(e) {
      if (destroyed) return;
      if (e.target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      if (game.phase === 'feedback' && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        advanceAfterFeedback();
        return;
      }
      if (game.phase !== 'driving') return;
      const k = e.key.toLowerCase();
      if (e.key === 'ArrowLeft' || k === 'a') {
        e.preventDefault();
        commitAction('left', false);
      } else if (e.key === 'ArrowRight' || k === 'd') {
        e.preventDefault();
        commitAction('right', false);
      } else if (e.key === 'ArrowUp' || k === 'w') {
        e.preventDefault();
        commitAction('straight', false);
      } else if (e.key === 'ArrowDown' || k === 's' || e.key === ' ') {
        e.preventDefault();
        commitAction('brake', false);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    startNewTrip();
    rafId = window.requestAnimationFrame(loop);

    activeCleanup = function cleanup() {
      destroyed = true;
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', onKeyDown);
    };
  }

  root.VarordakanGame = { mount, unmount };
})(typeof globalThis !== 'undefined' ? globalThis : window);
