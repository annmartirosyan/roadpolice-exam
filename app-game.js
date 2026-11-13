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
      propProgress: 0.14, // 0.08 (horizon) -> 1.0 (car line)
      timeLeft: ARCADE_TIME_SEC,
      carX: 0, // -1 left lane, 0 right lane, +1 far right bay
      carY: 0, // offset
      carAngle: 0,
      carSpeed: 50,
      targetAction: null,
      animProgress: 0,
      blinkTimer: 0,
      lastFrameMs: 0,
      puffs: [],
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
      game.propProgress = 0.14;
      game.timeLeft = ARCADE_TIME_SEC;
      game.carX = 0;
      game.carY = 0;
      game.carAngle = 0;
      game.carSpeed = sc.initialSpeed || 50;
      game.targetAction = null;
      game.animProgress = 0;
      game.puffs = [];
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
              <canvas id="game-road-canvas" width="960" height="540"></canvas>
              <div class="game-canvas-hud">
                <div class="game-speedo" id="hud-speed-pill">50 ${escapeHtml(ui.speedUnit)}</div>
              </div>
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
      const spPill = document.getElementById('hud-speed-pill');
      if (spPill) spPill.textContent = `${Math.round(game.carSpeed)} ${ui.speedUnit}`;
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
      const ui = UI_TEXT[getLang()] || UI_TEXT.hy;

      // Update motion
      game.blinkTimer += dt;
      if (game.phase === 'driving') {
        const pxPerSec = (game.carSpeed / 50) * 1.45;
        game.roadScroll = (game.roadScroll + pxPerSec * dt) % 1;
        if (game.mode === 'arcade') {
          game.timeLeft = Math.max(0, game.timeLeft - dt);
          game.propProgress = 0.14 + (1 - game.timeLeft / ARCADE_TIME_SEC) * 0.54;
          if (game.timeLeft <= 0) {
            commitAction('straight', true);
          }
        } else {
          if (game.propProgress < 0.44) {
            game.propProgress = Math.min(0.44, game.propProgress + dt * 0.22);
          }
        }
      } else if (game.phase === 'animating') {
        game.animProgress = Math.min(1, game.animProgress + dt * 1.45);
        const p = game.animProgress;
        const act = game.targetAction;
        if (act === 'brake') {
          game.carSpeed = Math.max(0, (sc.initialSpeed || 50) * (1 - p * 0.94));
          game.roadScroll = (game.roadScroll + (game.carSpeed / 50) * 1.2 * dt) % 1;
          game.propProgress = Math.min(0.72, game.propProgress + dt * 0.22);
          game.carY = Math.sin(p * Math.PI) * 6;
        } else if (act === 'left') {
          game.roadScroll = (game.roadScroll + (game.carSpeed / 50) * 1.3 * dt) % 1;
          game.propProgress = Math.min(0.86, game.propProgress + dt * 0.36);
          if (sc.scene === 'obstacle_center') {
            game.carX = -Math.sin(p * Math.PI) * 1.05;
            game.carAngle = -Math.sin(p * Math.PI * 2) * 0.12;
          } else {
            game.carX = -p * 1.45;
            game.carY = -p * 16;
            game.carAngle = -p * 0.36;
          }
        } else if (act === 'right') {
          game.roadScroll = (game.roadScroll + (game.carSpeed / 50) * 1.3 * dt) % 1;
          game.propProgress = Math.min(0.86, game.propProgress + dt * 0.36);
          if (sc.scene === 'obstacle_center') {
            game.carX = Math.sin(p * Math.PI) * 0.42;
            game.carAngle = Math.sin(p * Math.PI * 2) * 0.1;
          } else if (sc.scene === 'parking_bay') {
            game.carX = p * 1.1;
            game.carAngle = Math.sin(p * Math.PI) * 0.2;
            game.carSpeed = Math.max(0, 35 * (1 - p));
          } else {
            game.carX = p * 1.45;
            game.carY = -p * 16;
            game.carAngle = p * 0.36;
          }
        } else {
          game.roadScroll = (game.roadScroll + (game.carSpeed / 50) * 1.65 * dt) % 1;
          game.propProgress = Math.min(0.98, game.propProgress + dt * 0.44);
          game.carY = -Math.sin(p * Math.PI) * 10;
        }
        if (game.animProgress >= 1) {
          game.phase = 'feedback';
          updateHud();
        }
      }

      // Perspective helpers (0 = horizon, 1 = bottom camera plane)
      const horizonY = 166;
      const roadHeight = H - horizonY;
      const cx = W / 2;
      const roadHalfAt = (z) => 38 + z * 340; // width from 76px at horizon to 756px at bottom
      const yAt = (z) => horizonY + Math.pow(z, 1.38) * roadHeight;
      const scaleAt = (z) => 0.14 + Math.pow(z, 1.18) * 1.05;

      // 1. Sky gradient + warm sun + clouds
      const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
      skyGrad.addColorStop(0, '#38bdf8');
      skyGrad.addColorStop(0.55, '#bae6fd');
      skyGrad.addColorStop(1, '#fef9c3');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, horizonY + 4);

      // Sun halo
      const sunGrad = ctx.createRadialGradient(170, 58, 6, 170, 58, 68);
      sunGrad.addColorStop(0, 'rgba(254, 240, 138, 0.98)');
      sunGrad.addColorStop(0.35, 'rgba(253, 224, 71, 0.55)');
      sunGrad.addColorStop(1, 'rgba(253, 224, 71, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(170, 58, 68, 0, Math.PI * 2);
      ctx.fill();

      // Soft drifting clouds
      const cloudShift = (game.blinkTimer * 8) % (W + 240);
      drawCloud(ctx, ((220 + cloudShift) % (W + 220)) - 110, 48, 1.0);
      drawCloud(ctx, ((640 + cloudShift * 0.6) % (W + 220)) - 110, 68, 0.78);
      drawCloud(ctx, ((880 + cloudShift * 0.4) % (W + 220)) - 110, 38, 0.65);

      // Distant Armenian mountains (Ararat-inspired twin peaks + foothills)
      ctx.fillStyle = '#93c5fd';
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      ctx.lineTo(140, 108);
      ctx.lineTo(270, 138);
      ctx.lineTo(420, 86);
      ctx.lineTo(525, 128);
      ctx.lineTo(615, 102);
      ctx.lineTo(760, 142);
      ctx.lineTo(890, 114);
      ctx.lineTo(W, 144);
      ctx.lineTo(W, horizonY);
      ctx.closePath();
      ctx.fill();

      // Snow caps
      ctx.fillStyle = 'rgba(255,255,255,0.82)';
      ctx.beginPath();
      ctx.moveTo(420, 86);
      ctx.lineTo(388, 106);
      ctx.lineTo(410, 102);
      ctx.lineTo(424, 109);
      ctx.lineTo(445, 102);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(615, 102);
      ctx.lineTo(596, 117);
      ctx.lineTo(615, 113);
      ctx.lineTo(632, 118);
      ctx.closePath();
      ctx.fill();

      // 2. Ground grass bands (gives crisp sense of speed)
      const grassBands = 14;
      for (let i = 0; i < grassBands; i++) {
        const z0 = i / grassBands;
        const z1 = (i + 1) / grassBands;
        const y0 = yAt(z0);
        const y1 = yAt(z1);
        const stripe = Math.floor(i - game.roadScroll * 2) % 2 === 0;
        ctx.fillStyle = stripe ? '#4ade80' : '#22c55e';
        ctx.fillRect(0, y0, W, y1 - y0 + 1);
      }

      // 3. Perspective asphalt road
      const topHalf = roadHalfAt(0);
      const botHalf = roadHalfAt(1);
      const asphaltGrad = ctx.createLinearGradient(0, horizonY, 0, H);
      asphaltGrad.addColorStop(0, '#475569');
      asphaltGrad.addColorStop(0.45, '#334155');
      asphaltGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = asphaltGrad;
      ctx.beginPath();
      ctx.moveTo(cx - topHalf, horizonY);
      ctx.lineTo(cx + topHalf, horizonY);
      ctx.lineTo(cx + botHalf, H);
      ctx.lineTo(cx - botHalf, H);
      ctx.closePath();
      ctx.fill();

      // Alternating roadside curbs (clamped seamlessly from horizon to bottom)
      const curbSegs = 14;
      const curbOffset = game.roadScroll % 2;
      for (let i = -2; i <= curbSegs; i++) {
        const raw0 = (i + curbOffset) / curbSegs;
        const raw1 = (i + 1 + curbOffset) / curbSegs;
        if (raw1 <= 0 || raw0 >= 1) continue;
        const z0 = Math.max(0, raw0);
        const z1 = Math.min(1, raw1);
        const y0 = yAt(z0);
        const y1 = yAt(z1);
        const h0 = roadHalfAt(z0);
        const h1 = roadHalfAt(z1);
        const cw0 = 4 + z0 * 14;
        const cw1 = 4 + z1 * 14;
        const isRed = (((i % 2) + 2) % 2) === 0;
        ctx.fillStyle = isRed ? '#ef4444' : '#f8fafc';
        // Left curb
        ctx.beginPath();
        ctx.moveTo(cx - h0 - cw0, y0);
        ctx.lineTo(cx - h0, y0);
        ctx.lineTo(cx - h1, y1);
        ctx.lineTo(cx - h1 - cw1, y1);
        ctx.closePath();
        ctx.fill();
        // Right curb
        ctx.beginPath();
        ctx.moveTo(cx + h0, y0);
        ctx.lineTo(cx + h0 + cw0, y0);
        ctx.lineTo(cx + h1 + cw1, y1);
        ctx.lineTo(cx + h1, y1);
        ctx.closePath();
        ctx.fill();
      }

      // Solid white edge lines
      ctx.fillStyle = 'rgba(248, 250, 252, 0.9)';
      ctx.beginPath();
      ctx.moveTo(cx - topHalf + 2, horizonY);
      ctx.lineTo(cx - topHalf + 4, horizonY);
      ctx.lineTo(cx - botHalf + 18, H);
      ctx.lineTo(cx - botHalf + 8, H);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + topHalf - 4, horizonY);
      ctx.lineTo(cx + topHalf - 2, horizonY);
      ctx.lineTo(cx + botHalf - 8, H);
      ctx.lineTo(cx + botHalf - 18, H);
      ctx.closePath();
      ctx.fill();

      // Center dashed lane line (or solid for no-overtaking 3.20)
      if (sc.scene === 'slow_car') {
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.moveTo(cx - 1.5, horizonY);
        ctx.lineTo(cx + 1.5, horizonY);
        ctx.lineTo(cx + 6, H);
        ctx.lineTo(cx - 6, H);
        ctx.closePath();
        ctx.fill();
      } else {
        const dashCount = 10;
        for (let i = 0; i < dashCount; i++) {
          const zStart = ((i / dashCount) + game.roadScroll / dashCount) % 1;
          const zEnd = Math.min(1, zStart + 0.048);
          if (zEnd <= zStart) continue;
          const y0 = yAt(zStart);
          const y1 = yAt(zEnd);
          const dw0 = 1.5 + zStart * 4.5;
          const dw1 = 1.5 + zEnd * 4.5;
          ctx.fillStyle = 'rgba(248, 250, 252, 0.92)';
          ctx.beginPath();
          ctx.moveTo(cx - dw0, y0);
          ctx.lineTo(cx + dw0, y0);
          ctx.lineTo(cx + dw1, y1);
          ctx.lineTo(cx - dw1, y1);
          ctx.closePath();
          ctx.fill();
        }
      }

      // 4. Passing roadside trees & lamps in perspective
      const objCount = 6;
      for (let i = 0; i < objCount; i++) {
        const z = ((i / objCount) + game.roadScroll / objCount) % 1;
        if (z < 0.04) continue;
        const ty = yAt(z);
        const s = scaleAt(z);
        const rh = roadHalfAt(z);
        drawPerspectiveTree(ctx, cx - rh - 54 * s - 28, ty, s);
        if (i % 2 === 0) {
          drawPerspectiveLamp(ctx, cx + rh + 24 * s + 12, ty, s);
        } else {
          drawPerspectiveTree(ctx, cx + rh + 66 * s + 34, ty, s);
        }
      }

      // 5. Scenario-specific road props at pz = game.propProgress
      const pz = Math.max(0.08, Math.min(0.98, game.propProgress));
      const propY = yAt(pz);
      const pScale = scaleAt(pz);
      const pHalf = roadHalfAt(pz);
      const bandTopZ = Math.max(0.02, pz - 0.09);
      const bandBotZ = Math.min(0.99, pz + 0.09);
      const by0 = yAt(bandTopZ);
      const by1 = yAt(bandBotZ);
      const bh0 = roadHalfAt(bandTopZ);
      const bh1 = roadHalfAt(bandBotZ);

      if (sc.scene === 'intersection' || sc.scene === 'stop_line' || sc.scene === 'yield_line') {
        ctx.fillStyle = '#334155';
        ctx.fillRect(0, by0, W, by1 - by0);
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(0, by0, cx - bh0, 3 + 3 * pz);
        ctx.fillRect(cx + bh0, by0, W - (cx + bh0), 3 + 3 * pz);
        ctx.fillRect(0, by1 - 4, cx - bh1, 4 + 3 * pz);
        ctx.fillRect(cx + bh1, by1 - 4, W - (cx + bh1), 4 + 3 * pz);
        if (sc.scene === 'stop_line') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(cx + 4, by1 - 2, bh1 - 16, 6 * pScale + 2);
        }
        if (sc.scene === 'yield_line') {
          ctx.fillStyle = '#ffffff';
          const step = Math.max(14, 24 * pScale);
          for (let tx = cx + 10; tx < cx + bh1 - 18; tx += step) {
            ctx.beginPath();
            ctx.moveTo(tx, by1 - 6);
            ctx.lineTo(tx + step * 0.55, by1 - 6);
            ctx.lineTo(tx + step * 0.28, by1 + 6 * pScale);
            ctx.closePath();
            ctx.fill();
          }
          // Cross car approaching from left in perspective
          const crossX = cx - bh0 * 0.8 + Math.sin(game.blinkTimer * 1.8) * 35 * pScale;
          drawSideCar(ctx, crossX, (by0 + by1) / 2, pScale * 0.9, '#ef4444');
        }
      } else if (sc.scene === 't_right_straight') {
        ctx.fillStyle = '#334155';
        ctx.fillRect(cx, by0, W - cx, by1 - by0);
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(cx + bh0, by0, W - (cx + bh0), 4);
        ctx.fillRect(cx + bh1, by1 - 4, W - (cx + bh1), 4);
      } else if (sc.scene === 't_left_straight') {
        ctx.fillStyle = '#334155';
        ctx.fillRect(0, by0, cx, by1 - by0);
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(0, by0, cx - bh0, 4);
        ctx.fillRect(0, by1 - 4, cx - bh1, 4);
      } else if (sc.scene === 'roundabout') {
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.ellipse(cx, propY, pHalf * 1.45, (by1 - by0) * 1.15, 0, 0, Math.PI * 2);
        ctx.fill();
        // Green roundabout island
        ctx.fillStyle = '#16a34a';
        ctx.beginPath();
        ctx.ellipse(cx, propY, pHalf * 0.58, (by1 - by0) * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(2, 4 * pScale);
        ctx.stroke();
        // Center flower monument
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.ellipse(cx, propY - 4 * pScale, 12 * pScale, 8 * pScale, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (sc.scene === 'crosswalk') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        const stripes = 8;
        const sw = (bh1 * 1.8) / stripes;
        for (let i = 0; i < stripes; i++) {
          const sx = cx - bh1 * 0.9 + i * sw + sw * 0.16;
          ctx.fillRect(sx, by0 + 4, sw * 0.58, (by1 - by0) * 0.65);
        }
        // Animated walking pedestrian
        const pedProg = (game.blinkTimer * 0.38) % 1;
        const pedX = cx - bh0 * 0.75 + pedProg * (bh0 * 1.5);
        drawPedestrian(ctx, pedX, propY - 4 * pScale, pScale, game.blinkTimer);
      } else if (sc.scene === 'railway') {
        // Wooden sleepers & rails
        ctx.fillStyle = '#78350f';
        ctx.fillRect(0, propY - 10 * pScale, W, 20 * pScale);
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(0, propY - 7 * pScale, W, 3 * pScale + 1);
        ctx.fillRect(0, propY + 4 * pScale, W, 3 * pScale + 1);
        // Red & white crossing barrier across road
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(cx - pHalf, propY - 22 * pScale, pHalf * 2, 9 * pScale);
        ctx.fillStyle = '#ffffff';
        const segW = (pHalf * 2) / 9;
        for (let i = 1; i < 9; i += 2) {
          ctx.fillRect(cx - pHalf + i * segW, propY - 22 * pScale, segW, 9 * pScale);
        }
        // Flashing red railway warning lights on left post
        const flashA = Math.floor(game.blinkTimer * 4) % 2 === 0;
        const lx = cx - pHalf - 16 * pScale;
        ctx.fillStyle = '#334155';
        ctx.fillRect(lx - 3 * pScale, propY - 46 * pScale, 6 * pScale, 48 * pScale);
        ctx.fillStyle = flashA ? '#ef4444' : '#7f1d1d';
        ctx.beginPath();
        ctx.arc(lx - 8 * pScale, propY - 44 * pScale, 5 * pScale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = !flashA ? '#ef4444' : '#7f1d1d';
        ctx.beginPath();
        ctx.arc(lx + 8 * pScale, propY - 44 * pScale, 5 * pScale, 0, Math.PI * 2);
        ctx.fill();
      } else if (sc.scene === 'obstacle_center') {
        // Construction barrier & orange cones in right lane
        const bx = cx + pHalf * 0.44;
        const bw = 96 * pScale;
        const bh = 26 * pScale;
        ctx.fillStyle = 'rgba(15,23,42,0.35)';
        ctx.fillRect(bx - bw / 2 + 4, propY + 2, bw, 8 * pScale);
        ctx.fillStyle = '#f97316';
        ctx.fillRect(bx - bw / 2, propY - bh, bw, bh);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(bx - bw * 0.3, propY - bh, bw * 0.16, bh);
        ctx.fillRect(bx + bw * 0.12, propY - bh, bw * 0.16, bh);
        // Amber blinking hazard beacon
        const beaconOn = Math.floor(game.blinkTimer * 5) % 2 === 0;
        ctx.fillStyle = beaconOn ? '#fde047' : '#ca8a04';
        ctx.beginPath();
        ctx.arc(bx, propY - bh - 6 * pScale, 6 * pScale, 0, Math.PI * 2);
        ctx.fill();
      } else if (sc.scene === 'slow_car') {
        drawPerspectiveTruck(ctx, cx + pHalf * 0.48, propY, pScale);
      } else if (sc.scene === 'narrow_bridge') {
        // Stone bridge walls narrowing road + oncoming red car
        const wallW = pHalf * 0.38;
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(cx - pHalf, by0 - 12 * pScale, wallW, by1 - by0 + 16 * pScale);
        ctx.fillRect(cx + pHalf - wallW, by0 - 12 * pScale, wallW, by1 - by0 + 16 * pScale);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(cx - pHalf, by0 - 12 * pScale, wallW, 5 * pScale);
        ctx.fillRect(cx + pHalf - wallW, by0 - 12 * pScale, wallW, 5 * pScale);
        drawOncomingCar(ctx, cx - pHalf * 0.22, propY - 10 * pScale, pScale * 0.95);
      } else if (sc.scene === 'slippery') {
        const iceGrad = ctx.createRadialGradient(
          cx + pHalf * 0.35,
          propY,
          8 * pScale,
          cx + pHalf * 0.35,
          propY,
          85 * pScale
        );
        iceGrad.addColorStop(0, 'rgba(125, 211, 252, 0.72)');
        iceGrad.addColorStop(1, 'rgba(56, 189, 248, 0.12)');
        ctx.fillStyle = iceGrad;
        ctx.beginPath();
        ctx.ellipse(cx + pHalf * 0.35, propY, 85 * pScale, 28 * pScale, 0.08, 0, Math.PI * 2);
        ctx.fill();
      } else if (sc.scene === 'no_stop_curb') {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(cx + bh0 - 6, by0);
        ctx.lineTo(cx + bh0 + 8, by0);
        ctx.lineTo(cx + bh1 + 14, by1);
        ctx.lineTo(cx + bh1 - 8, by1);
        ctx.closePath();
        ctx.fill();
      } else if (sc.scene === 'parking_bay') {
        const bayW = 76 * pScale + 18;
        ctx.fillStyle = '#334155';
        ctx.fillRect(cx + bh0, by0, bayW, by1 - by0);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(2, 3 * pScale);
        ctx.strokeRect(cx + bh0 + 4, by0 + 4, bayW - 8, by1 - by0 - 8);
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.round(28 * pScale + 8)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('P', cx + bh0 + bayW / 2, (by0 + by1) / 2 + 8 * pScale);
      }

      // 6. 3D Roadside Signpost on right shoulder
      const postX = cx + pHalf + 48 * pScale + 14;
      const postBaseY = propY + 8 * pScale;
      const poleH = 88 * pScale + 16;
      const signTopY = postBaseY - poleH;
      const signSize = 58 * pScale + 18;

      // Ground shadow under signpost
      ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
      ctx.beginPath();
      ctx.ellipse(postX + 8 * pScale, postBaseY, 16 * pScale + 4, 5 * pScale + 2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Metal pole
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(postX - 3 * pScale, signTopY, 6 * pScale, poleH);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(postX, signTopY, 3 * pScale, poleH);

      // Sign plaque + subtle pulse ring
      if (game.phase === 'driving') {
        const pulse = 0.5 + 0.5 * Math.sin(game.blinkTimer * 5);
        ctx.strokeStyle = `rgba(37, 99, 235, ${0.22 + pulse * 0.28})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(postX, signTopY, signSize * 0.62 + pulse * 6, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(postX, signTopY, signSize * 0.56, 0, Math.PI * 2);
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
        ctx.drawImage(img, postX - dw / 2, signTopY - dh / 2, dw, dh);
      }

      // 7. Exhaust puffs + Chase-camera Player Car
      const baseCarX = cx + 110 + game.carX * 145;
      const suspensionBounce = game.carSpeed > 2 ? Math.sin(game.blinkTimer * 18) * 1.4 : 0;
      const baseCarY = H - 74 + game.carY + suspensionBounce;
      if (game.carSpeed > 8 && Math.random() < 0.35) {
        game.puffs.push({ x: baseCarX - 28, y: baseCarY + 34, r: 3.5, a: 0.45 });
      }
      for (let i = game.puffs.length - 1; i >= 0; i--) {
        const pf = game.puffs[i];
        pf.y += 45 * dt;
        pf.x -= 8 * dt;
        pf.r += 14 * dt;
        pf.a -= 0.9 * dt;
        if (pf.a <= 0) {
          game.puffs.splice(i, 1);
        } else {
          ctx.fillStyle = `rgba(226, 232, 240, ${pf.a})`;
          ctx.beginPath();
          ctx.arc(pf.x, pf.y, pf.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      const braking = game.targetAction === 'brake' && game.phase !== 'driving';
      const blinkSide =
        game.phase === 'animating' && (game.targetAction === 'left' || game.targetAction === 'right')
          ? game.targetAction
          : null;
      drawChaseCar(
        ctx,
        baseCarX,
        baseCarY,
        game.carAngle,
        braking,
        blinkSide,
        Math.floor(game.blinkTimer * 7) % 2 === 0
      );

      // Update live timer fill & speed in HUD
      const tFill = document.getElementById('game-timer-fill');
      if (tFill && game.mode === 'arcade' && game.phase === 'driving') {
        const pct = Math.max(0, Math.min(100, (game.timeLeft / ARCADE_TIME_SEC) * 100));
        tFill.style.width = `${pct}%`;
        tFill.style.background = pct < 30 ? '#dc2626' : pct < 60 ? '#f59e0b' : '#16a34a';
      }
      const spEl = document.getElementById('hud-speed');
      if (spEl) spEl.textContent = `${Math.round(game.carSpeed)} ${ui.speedUnit}`;
      const spPill = document.getElementById('hud-speed-pill');
      if (spPill) spPill.textContent = `${Math.round(game.carSpeed)} ${ui.speedUnit}`;
    }

    function drawCloud(c, x, y, s) {
      c.fillStyle = 'rgba(255, 255, 255, 0.85)';
      c.beginPath();
      c.arc(x, y, 20 * s, 0, Math.PI * 2);
      c.arc(x + 22 * s, y - 6 * s, 24 * s, 0, Math.PI * 2);
      c.arc(x + 46 * s, y, 18 * s, 0, Math.PI * 2);
      c.fill();
    }

    function drawPerspectiveTree(c, x, y, s) {
      // Shadow
      c.fillStyle = 'rgba(15, 23, 42, 0.16)';
      c.beginPath();
      c.ellipse(x + 8 * s, y, 22 * s, 7 * s, 0, 0, Math.PI * 2);
      c.fill();
      // Trunk
      c.fillStyle = '#78350f';
      c.fillRect(x - 4 * s, y - 30 * s, 8 * s, 30 * s);
      // Canopy
      c.fillStyle = '#15803d';
      c.beginPath();
      c.arc(x, y - 42 * s, 22 * s, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#22c55e';
      c.beginPath();
      c.arc(x - 6 * s, y - 48 * s, 15 * s, 0, Math.PI * 2);
      c.fill();
    }

    function drawPerspectiveLamp(c, x, y, s) {
      c.fillStyle = '#475569';
      c.fillRect(x - 2 * s, y - 78 * s, 4 * s, 78 * s);
      c.fillRect(x - 16 * s, y - 78 * s, 16 * s, 3 * s);
      c.fillStyle = '#fef08a';
      c.beginPath();
      c.arc(x - 15 * s, y - 74 * s, 4 * s, 0, Math.PI * 2);
      c.fill();
    }

    function drawPedestrian(c, x, y, s, t) {
      const swing = Math.sin(t * 10) * 6 * s;
      // Shadow
      c.fillStyle = 'rgba(15, 23, 42, 0.25)';
      c.beginPath();
      c.ellipse(x, y + 2 * s, 9 * s, 4 * s, 0, 0, Math.PI * 2);
      c.fill();
      // Legs
      c.strokeStyle = '#1e293b';
      c.lineWidth = Math.max(2, 4 * s);
      c.beginPath();
      c.moveTo(x - 2 * s, y - 14 * s);
      c.lineTo(x - 3 * s + swing, y);
      c.moveTo(x + 2 * s, y - 14 * s);
      c.lineTo(x + 3 * s - swing, y);
      c.stroke();
      // Jacket
      c.fillStyle = '#f97316';
      c.beginPath();
      c.roundRect(x - 6 * s, y - 30 * s, 12 * s, 17 * s, 4 * s);
      c.fill();
      // Head
      c.fillStyle = '#fed7aa';
      c.beginPath();
      c.arc(x, y - 36 * s, 5.5 * s, 0, Math.PI * 2);
      c.fill();
    }

    function drawSideCar(c, x, y, s, color) {
      c.save();
      c.translate(x, y);
      c.scale(s, s);
      c.fillStyle = 'rgba(15, 23, 42, 0.28)';
      c.fillRect(-34, 8, 68, 12);
      c.fillStyle = color;
      c.beginPath();
      c.roundRect(-34, -14, 68, 24, 7);
      c.fill();
      c.fillStyle = '#1e293b';
      c.beginPath();
      c.roundRect(-18, -26, 36, 14, 5);
      c.fill();
      c.fillStyle = '#0f172a';
      c.beginPath();
      c.arc(-18, 10, 8, 0, Math.PI * 2);
      c.arc(18, 10, 8, 0, Math.PI * 2);
      c.fill();
      c.restore();
    }

    function drawOncomingCar(c, x, y, s) {
      c.save();
      c.translate(x, y);
      c.scale(s, s);
      c.fillStyle = 'rgba(15, 23, 42, 0.3)';
      c.beginPath();
      c.ellipse(0, 18, 34, 9, 0, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#dc2626';
      c.beginPath();
      c.roundRect(-30, -14, 60, 30, 8);
      c.fill();
      c.fillStyle = '#93c5fd';
      c.beginPath();
      c.roundRect(-22, -26, 44, 15, 6);
      c.fill();
      // Headlights
      c.fillStyle = '#fef08a';
      c.fillRect(-24, 0, 10, 6);
      c.fillRect(14, 0, 10, 6);
      c.restore();
    }

    function drawPerspectiveTruck(c, x, y, s) {
      c.save();
      c.translate(x, y);
      c.scale(s, s);
      // Shadow
      c.fillStyle = 'rgba(15, 23, 42, 0.35)';
      c.beginPath();
      c.ellipse(0, 8, 44, 12, 0, 0, Math.PI * 2);
      c.fill();
      // Tires
      c.fillStyle = '#0f172a';
      c.fillRect(-38, -6, 12, 16);
      c.fillRect(26, -6, 12, 16);
      // Cargo box
      c.fillStyle = '#f59e0b';
      c.beginPath();
      c.roundRect(-40, -74, 80, 70, 6);
      c.fill();
      c.strokeStyle = '#d97706';
      c.lineWidth = 3;
      c.strokeRect(-34, -68, 32, 58);
      c.strokeRect(2, -68, 32, 58);
      // Taillights
      c.fillStyle = '#ef4444';
      c.fillRect(-36, -12, 12, 6);
      c.fillRect(24, -12, 12, 6);
      c.restore();
    }

    function drawChaseCar(c, x, y, angle, braking, blinkSide, blinkOn) {
      c.save();
      c.translate(x, y);
      c.rotate(angle || 0);

      // Soft ground shadow
      c.fillStyle = 'rgba(15, 23, 42, 0.45)';
      c.beginPath();
      c.ellipse(0, 34, 62, 15, 0, 0, Math.PI * 2);
      c.fill();

      // Rear tires
      c.fillStyle = '#0f172a';
      c.beginPath();
      c.roundRect(-54, 10, 16, 28, 4);
      c.roundRect(38, 10, 16, 28, 4);
      c.fill();

      // Lower bumper & diffuser
      c.fillStyle = '#1e293b';
      c.beginPath();
      c.roundRect(-52, 14, 104, 18, 6);
      c.fill();

      // Twin exhaust tips
      c.fillStyle = '#94a3b8';
      c.beginPath();
      c.arc(-30, 27, 4, 0, Math.PI * 2);
      c.arc(30, 27, 4, 0, Math.PI * 2);
      c.fill();

      // Main metallic blue rear body
      const bodyGrad = c.createLinearGradient(0, -18, 0, 22);
      bodyGrad.addColorStop(0, '#3b82f6');
      bodyGrad.addColorStop(0.55, '#2563eb');
      bodyGrad.addColorStop(1, '#1d4ed8');
      c.fillStyle = bodyGrad;
      c.beginPath();
      c.moveTo(-54, 16);
      c.lineTo(-48, -12);
      c.lineTo(48, -12);
      c.lineTo(54, 16);
      c.closePath();
      c.fill();

      // Side mirrors
      c.fillStyle = '#1d4ed8';
      c.beginPath();
      c.roundRect(-58, -16, 12, 8, 3);
      c.roundRect(46, -16, 12, 8, 3);
      c.fill();

      // Cabin & sloped rear windshield
      c.fillStyle = '#1d4ed8';
      c.beginPath();
      c.moveTo(-40, -12);
      c.lineTo(-30, -34);
      c.lineTo(30, -34);
      c.lineTo(40, -12);
      c.closePath();
      c.fill();

      const glassGrad = c.createLinearGradient(-24, -30, 24, -10);
      glassGrad.addColorStop(0, '#0f172a');
      glassGrad.addColorStop(0.5, '#1e293b');
      glassGrad.addColorStop(1, '#334155');
      c.fillStyle = glassGrad;
      c.beginPath();
      c.moveTo(-34, -12);
      c.lineTo(-26, -30);
      c.lineTo(26, -30);
      c.lineTo(34, -12);
      c.closePath();
      c.fill();

      // Glass glare streak
      c.strokeStyle = 'rgba(148, 163, 184, 0.38)';
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(-18, -28);
      c.lineTo(-6, -14);
      c.stroke();

      // License plate
      c.fillStyle = '#f8fafc';
      c.beginPath();
      c.roundRect(-17, 5, 34, 10, 2);
      c.fill();
      c.fillStyle = '#2563eb';
      c.fillRect(-17, 5, 5, 10);

      // Tail-lights (glow brightly when braking)
      if (braking) {
        c.fillStyle = 'rgba(239, 68, 68, 0.45)';
        c.beginPath();
        c.arc(-39, 1, 16, 0, Math.PI * 2);
        c.arc(39, 1, 16, 0, Math.PI * 2);
        c.fill();
      }
      c.fillStyle = braking ? '#ff2a2a' : '#b91c1c';
      c.beginPath();
      c.roundRect(-48, -4, 18, 10, 3);
      c.roundRect(30, -4, 18, 10, 3);
      c.fill();

      // Center high-mount brake strip
      c.fillStyle = braking ? '#ff3b3b' : '#7f1d1d';
      c.fillRect(-12, -13, 24, 3);

      // Turn signal blinkers
      if (blinkSide && blinkOn) {
        c.fillStyle = '#fbbf24';
        if (blinkSide === 'left') {
          c.beginPath();
          c.roundRect(-52, -4, 8, 10, 2);
          c.fill();
        } else if (blinkSide === 'right') {
          c.beginPath();
          c.roundRect(44, -4, 8, 10, 2);
          c.fill();
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
