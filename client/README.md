# TinyHouse Client

Данная документация содержит описание функциональных возможностей клиентской части приложения TinyHouse. Информация о том, что из себя представляет проект TinyHouse, какие в нём использованы технологии, краткое их описание, а также о том, как развернуть проект, находится в [общей документации](./../README.md) проекта.

Клиент - это одностраничное приложение (англ. [single-page application](https://en.wikipedia.org/wiki/Single-page_application), [SPA](https://developer.mozilla.org/en-US/docs/Glossary/SPA)), написанное на [React](https://reactjs.org/)/[TypeScript](https://www.typescriptlang.org/), которое взаимодействует с [GraphQL](https://graphql.org/) API посредством библиотеки [Apollo Client](https://www.apollographql.com/apollo-client).

## Маршрутизация

Поскольку TinyHouse является одностраничным приложением, сервер будет возвращать одну и ту же индексную страницу независимо от того, на каком маршруте находится пользователь.

Хотя для React-приложений существует множество различных библиотек маршрутизации, явным фаворитом сообщества является [React Router](https://reactrouter.com/). React Router даёт прекрасную основу для создания многофункциональных приложений, которые имеют множество компонентов, отображаемых по разным URL-адресам.

Клиент использует React Router для создания маршрутов и рендера различных компонентов на их основе, созданых с помощью фреймфорка [Ant Design](https://ant.design/) и кастомных CSS-стилей. (Кастомные CSS-классы написаны с использованием методологии [БЭМ](https://ru.bem.info/methodology/).)

В приложении определены следующие маршруты:

- / (корневой)

  Отображает домашнюю страницу приложения. Представляет собой лэндинг (англ. landing), который объясняет, что из себя представляет TinyHouse, и содержит навигацию по приложению. Из домашней страницы, например, можно перейти на страницу с наиболее премиальными объявлениями или страницу с объявлениями для популярных городов.

- /host

  Маршрут для создания пользователем нового объявления. Страница по этому маршруту проверяет, авторизован ли пользователь в приложении, а также подключён ли он к платформе обработки платежей [Stripe](https://stripe.com/). Если пользователь авторизован и подключён к Stripe, он увидит форму для создания объявления.

- /listing/:id

  Отображает подробную информацию об отдельном объявлении. Этот маршрут принимает id в качестве параметра динамического URL. Если пользователь просматривает своё собственное объявление, на странице объявления также отображается конфиденциальная информация, такая как сделанные для этого объявления бронирования.

- /listings/:location?

  Отображает все объявления, соответствующие определенному месту. Например, если пользователь был заинтересован в просмотре объявлений для города Торонто, он перейдёт по маршруту "/listings/toronto", где URL-параметром ":location" в данном контексте является "toronto".

  URL-параметр ":location" является необязательным: при его отсутствии будут отображены все возможные объявления, без фильтрации по местоположению.

- /login

  Страница по данному маршруту позволяет пользователю начать процесс авторизации с помощью своей учётной записи Google. Помимо этого, на эту страницу Google OAuth перенаправляет пользователя после успешной авторизации, передавая в параметрах запроса код, который используется на стороне сервера для аутентификации пользователя в приложении.

- /user/:id

  Отображает сведения об отдельном пользователе. Принимает URL-параметр ":id". Если пользователь просматривает свою собственную персональную страницу, то ему отображается конфиденциальная информация, такая как сумма полученного дохода.

- /stripe

  По данному адресу Stripe OAuth перенаправляет пользователя, когда тот подключается к своей учётной записи Stripe, передавая в параметрах запроса код, который используется для связи с Node-сервером. В отличии от страницы авторизации ("/login"), данная страница используется только для редиректа. Поэтому, если пользователь попытается получить доступ к маршруту "/stripe" непосредственно из адресной строки, то он перенаправляется на свою персональную страницу.

- /not-found

  Пользователь перенаправляется на страницу "not found", если пытается получить доступ к любому не определённому в приложении маршруту.

## Запросы к серверу

Большинство запросов на получение данных с сервера (или просто - "запросы") выполняются при первой загрузке страницы, а запросы на изменение данных (или просто - "мутации") - как правило на основе действий пользователя. В соответствии с этим, запросы уровня страницы обычно выполняются в родительских компонентах, соответствующих тем или иным представлениям (англ. view), которые рендерятся для определенных для них маршрутов (например, компонент "User" отображается по маршруту "/user/:id"), а мутации - в дочерних компонентах. Данный шаблон удобен для организации и поддержания кода, однако в некоторых областях приложения, ввиду особенностей реализации функциональности, он не соблюдается, например, при обработке OAuth.

При неудачных запросах на получение или изменение данных на странице отображаются ошибки и уведомления.

## Функциональные возможности

### 1. Регистрация и авторизация пользователя через Google Sign-In

Когда пользователь пытается авторизоваться в приложении с помощью [Google Sign-In](https://developers.google.com/identity/sign-in/web/sign-in), ему будет предложено предоставить информацию о своей учётной записи Google, и в случае успеха он будет направлен в приложение TinyHouse в залогиненном состонии.

_Процесс авторизации:_

1.  Пользователь нажимает в хедере (англ. header - "верхний колонтитул") кнопку "Sing In" ("Войти") и перенаправляется на страницу авторизации (маршрут "/login").
2.  На странице авторизации пользователь нажимает кнопку "Sign In With Google" ("Войти с помощью Google"), после чего клиент запрашивает у сервера URL для авторизации на сервере Google.
3.  Клиент получает от сервера URL для авторизации и перенаправляет пользователя по этому URL.
4.  После авторизации на сервере Google, пользователь перенаправляется обратно на страницу аавторизации в приложении TinyHouse. В URL, в параметрах запроса, содержится код авторизации от Google.
5.  Клиент отправляет серверу полученный от Google код авторизации.
6.  После успешного завершения процесса авторизации и ответа от сервера, пользователь перенаправляется на страницу со своим профилем (маршрут "/user/:id").

_Индикация, которую видит пользователь:_

- Индикатор загрузки во время выполнения авторизации на сервере.
- Сообщение об ошибке, если после нажатия кнопки "Sign In With Google" ("Войти с помощью Google") клиент не получит от сервера URL для авторизации в Google.
- Баннер с ошибкой, если после авторизации в Google, редиректа на страницу авторизации в приложении и отправки серверу кода авторизации сервер не может корректно завершить процесс авторизации.
- Уведомление об успешной авторизации в случае успешного завершения процесса авторизации.

_Когда пользователь авторизован:_

- он может бронировать объявления;
- если подключён его Stripe-аккаунт, он может создавать объявления;
- в хедере вместо кнопки "Sign In" ("Войти") отображается аватарка пользователя, при наведении на которую появляется выпадающее меню с ссылкой "Profile" ("Профиль пользователя") и кнопкой "Log Out" ("Выйти").

_Если пользователь нажимает кнопку "Log Out" и успешно выходит из приложения:_

- в хедер вместе аватарки пользователя возвращается кнопка "Sign In";
- пользователю отображается сообщение об успешном выходе из системы.

### 2. Разрешены постоянные login-сессии с помощью cookie и session storage

Постоянные login-сессии (сеансы входа в систему) позволяют пользователю оставаться авторизованным в течение нескольких сеансов браузера, т.е. при закрытии и повторном открытии браузера (или обновлении страницы в браузере) пользователь не должен будет заново проходить процесс авторизации.

_Cookie_

Для достижения такой функциональности в приложении используются [куки](https://ru.wikipedia.org/wiki/Cookie) (англ. cookie, , букв. - "печенье"). Куки - это небольшой фрагмент данных, отправленный веб-сервером и хранимый на компьютере пользователя. Клиент при попытке открыть страницу соответствующего веб-сайта пересылает этот фрагмент в составе HTTP-запроса. Применяется для сохранения данных на стороне пользователя, на практике обычно используется для:

- аутентификации пользователя;
- хранения персональных предпочтений и настроек пользователя;
- отслеживания состояния сеанса доступа пользователя;
- сведения статистики о пользователях.

Поскольку cookie постоянно хранятся в памяти браузера, обновление веб-страницы, закрытие и повторное открытие вкладки или окна браузера или даже перезагрузка компьютера не удаляют эти данные. Cookie часто удаляются, когда истекает срок их действия или путём очистки памяти браузера.

_XSS_

Если cookie помечены флагом "httpOnly", это гарантирует, что доступ к cookie возможен только с сервера и, как следствие, его нельзя изменить с помощью JavaScript, запущенного в браузере. В отличии от других механизмов хранения данных на стороне клиента, а именно: localStorage и sessionStorage, которые позволяют получить доступ к данным посредством JavaScript-кода, выполняемого в браузере, cookie, используемые с флагом "httpOnly", не подвержены влиянию [XSS](https://developer.mozilla.org/en-US/docs/Glossary/Cross-site_scripting)-атак (англ. [Cross-Site Scripting](https://en.wikipedia.org/wiki/Cross-site_scripting) - «межсайтовый скриптинг»). XSS - это тип атаки, заключающийся во внедрении в приложение вредоносного кода, который будет выполнен на компьютере пользователя при использовании им этого приложения, и взаимодействии этого кода с веб-сервером злоумышленника. Несмотря на то, что используемая в приложении библиотека React предотвращает подобные атаки, считается нормой для авторизации использовать именно cookie, а не localStorage или sessionStorage, т.к. их использование с флагом "secure" гарантирует, что они могут быть отправлены только по защищённому [HTTPS](https://ru.wikipedia.org/wiki/HTTPS)-соединению.

_CSRF_

Однако cookie уязвимы для [CSRF](https://developer.mozilla.org/en-US/docs/Glossary/CSRF)-атак (англ. [Cross-Site Request Forgery](https://en.wikipedia.org/wiki/Cross-site_request_forgery) - "межсайтовая подделка запроса"). CSRF - это тип атаки, который происходит, когда пользователя заманивают на вредоносный веб-сайт, в результате чего браузер от лица пользователя выполняет нежелательный HTTP-запрос к другому веб-серверу, на котором пользователь аутентифицирован.

В целях противодействия CSRF-атакам для cookie был разработан флаг "sameSite", который гарантирует, что cookie не будут отправлены с межсайтовыми запросами. Хотя данные флаг появился недавно, он поддерживается большинством основных браузеров. Однако на данный момент не все веб-браузеры поддерживают эту технологию. Итак, пока что лучшая стратегия противидействия CSRF - это также включать в каждый HTTP-запрос дополнительный секретный уникальный ключ (X-CSRF-TOKEN), который ассоциируется с каждой сессией пользователя. Сервер проверяет этот ключ перед выполнением каких-либо действий, что гарантирует защиту от CSRF-атак. При этом должна быть обеспечена защита от XSS-атак, позволяющих злоумышленнику получить уникальный ключ.

_X-CSRF Token_

Каждый запрос клиента к серверу должен включать заголовок "X-CSRF-TOKEN", содержащий токен, который сервер использует для подтверждения того, что запрос исходит от авторизованного пользователя. Приложение сохраняет данный токен в sessionStorage после каждой успешной авторизации пользователя и удаляет послего того, как пользователь выходит из системы. Ранее сохранённый токен также удаляется из sessionStorage, если пользователю не удаётся по каким-либо причинам авторизоваться с помощью cookie.

_Процесс авторизации с помощью cookie:_

1.  Приложение загружается и отправляет запрос на сервер. Если cookie доступны, то они автоматически отправляются на сервер вместе с запросом.
2.  Если cookie действительны и содержат валидный токен доступа, сервер попытается найти пользователя в базе данных.
3.  В случае успешного поиска пользователя в базе данных, сервер вернёт клиенту информацию о пользователе.
4.  Приложение, получив информацию об авторизованном пользователе, изменит состояние пользователя на "авторизован".

_Индикация, которую видит пользователь при авторизации с помощью cookie:_

- При запуске приложения и отправке на сервер запроса на авторизацию, пользователю отображается вращающийся индикатор состояния загрузки.
- При неуспешной авторизации, приложение перестаёт показывать пользователю индикатор загрузки и отображает баннер с ошибкой, уведомляющий его о том, что что-то пошло не так.

_Выход из системы_

Когда пользователь выходит из системы, сервер отправляет клиенту ответ, содержащий указание очистить cookie.

### 3. Отображение информации о пользователе на странице пользователя

_Пользователь, просматривающий страницу своего профиля, может видеть следующую информацию:_

- имя, контактные данные и доход от брониваний созданных им объявлений;
- список созданных им объявлений;
- список сделанных им бронирований.

Доход от бронирований отображается для пользователя только в том случае, если он подключил свой аккаунт Stripe. В противном случае пользователь увидит предложение подключить Stripe-аккаунт и кнопку для инициализации процесса подключения.

_Если пользователь просматривает страницу с профилем другого пользователя, то ему доступны:_

- имя и контактные данные другого пользователя;
- список объявлений, созданных другим пользователем.

Когда пользователь посещяет страницу действительного пользователя, то, чтобы уменьшить дискомфорт от ожидания загрузки данных с сервера, ему отображается _макет страницы (скелет)_. После получения ответа от сервера, скелет заменяется действительной информацией, а пользователю кажется, что всё происходит мгновенно. Для списка объявлений и списка бронирований реализована _пагинация_. При попытке посещения маршрута "/user/:id" с несуществующим идентификатором пользователя, запрос к серверу будет выполнен, но помимо скелета пользователю также отобразится баннер с ошибкой.

Для страницы с профайлом пользователя реализовано _кэширование_ с помощью библиотеки Apollo Client, которая настраивает [интеллектуальный кэш в памяти без какой-либо конфигурации со стороны разработчика](https://www.apollographql.com/docs/react/why-apollo/#zero-config-caching). Кэширование экономит время и помогает избежать ненужных повторных запросов данных с сервера, которые клиент уже ранее запрашивал.

### 4. Подключение Stripe-аккаунта для возможности создавать объявления и получать платежи за их бронирование

Если пользователь заинтересован в размещении объявлений, ему сначала необходимо подключить свою учётную запись Stripe, которая позволит ему получать платежи от других пользователей. Подключение Stripe-аккаунта осуществляется на странице пользователя.

Когда пользователь пытается подключить свою учётную запись Stripe, ему будет предложено предоставить информацию об этой учётной записи, и в случае успеха он будет перенаправлен в приложение TinyHouse.

Пользователь, подключивший к приложению свой Stripe-аккаунт, может создавать объявления и видеть общий доход, который он получил от бронирования созданных их объявлений.

Пользователь может отключить свой Stripe-аккаунт от приложения TinyHouse.

### 5. Создание объявления

Создавать объявления могут только авторизованные пользователи, подключившие свой Stripe-аккаунт.

_Загрузка изображения_

При создании объявления пользователь должен прикрепить изображение дома или апартаментов для аренды, которое должно удовлетворять следующим условиям:

1.  формат JPG или PNG;
2.  размер не более 1 Мбайт.

При передаче серверу изображение кодируется в формат Base64.

[Кодирование Base64](https://developer.mozilla.org/en-US/docs/Glossary/Base64) - это, по сути, способ преобразования данных в простые печатные символы. Широко используется в случаях, когда требуется перекодировать двоичные данные для передачи по каналу приспособленному для передачи текстовых данных. Это делается с целью защиты двоичных данных от любых возможных повреждений при передаче.

В приложении TinyHouse клиент не может передать серверу изображение объявления как файл через GraphQL API. Вместо этого клиент преобразует изображение в формат с кодировкой Base64, т.е. в строковое представление данных.

### 6. Отображение информации об объявлении на странице объявления

Когда пользователь выбирает объявление из списка предоставленных ему объявлений, ему становятся доступны конкретные сведения об этом объявлении, состоящие из заголовка, описания, изображения, адреса и владельца объявления. Если пользователь просматривает собственное объявление, ему также становится доступна информация о сделанных бронированиях для этого объявления.

На странице объявления пользователь может сделать бронирование на определённый период времени. Пользователю отображаются два дейтпикера (англ. date picker - "выбор даты"), где он выбирает дату заезда и дату выезда. Пользователь не может выбрать дату раньше сегодняшнего дня, а также дату выезда раньше даты заезда. Дейтпикер для даты выезда и кнопка для запроса бронирования становятся доступны пользователю только после того, как он предоставит информацию о дате заезда.

Когда пользователь посещяет страницу существующего объявления, то, чтобы уменьшить дискомфорт от ожидания загрузки данных с сервера, ему отображается _макет страницы (скелет)_. После получения ответа от сервера, скелет заменяется действительной информацией, а пользователю кажется, что всё происходит мгновенно. При попытке посещения маршрута "/listing/:id" с несуществующим идентификатором объявления, запрос к серверу будет выполнен, но помимо скелета пользователю также отобразится баннер с ошибкой.

Для списка бронирований реализована _пагинация_.

### 7. Поиск объявлений в разных местах мира (по местоположению)

Предоставить пользователю возможность искать объявления по местоположению - не тривиальная задача. Вероятно, её можно решить по-разному.

Очень простой подход мог бы заключаться в том, что приложение позволяет пользователю заполнить форму, указав значения для города, штата и страны. В базе данных можно было бы попробовать сделать так, чтобы документы, соответствующие объявлениям, содержали некоторые из этих данных, и можно было бы фильтровать и находить правильные списки на основе пользовательского поиска.

Такой подход более самостоятельный, и здесь есть много вопросов, над которыми стоит подумать:

- Как приложение должно исправлять орфографические ошибки от пользователей, предоставляющих информацию о местоположении?
- Как приложение должно обрабатывать получение информации для множества различных регионов мира, учитывая, что некоторые регионы могут не иметь понятие штата, провинции и т.д.?

Требуется более надежный подход, например, подобный тому, как [Airbnb](http://airbnb.com/) решает такую задачу. На веб-сайте Airbnb часто существует поле ввода, в котором пользователь может ввести город, штат, страну или их комбинацию, и сервер найдёт объявления, которые лучше всего соответствуют вводимым пользователем данным. (Примечание: Airbnb предоставляет возможности поиска разными способами. Указанный подход является более простым.)

Для реализации подобной функциональности в приложении TinyHouse используется [Google's Geocoding API](https://developers.google.com/maps/documentation/geocoding/overview).

Google's Geocoding API - это сервис, обеспечивающий геокодирование и обратное геокодирование адресов. Из документации:

- Геокодирование - это процесс преобразования адресов (например, адреса улицы) в географические координаты (например, широту и долготу), которые можно использовать для размещения указателей на карте или расположения карты.
- Обратное геокодирование - это процесс преобразования географических координат в удобочитаемый адрес.

Примечание: в приложении используется бесплатный пробный период для Google Geocoding API продолжительностью 90 дней. Если при попытке поиска объявления появляется баннер с ошибкой, то, скорее всего, пробный период истек.

Примеры в контексте приложения TinyHouse:

- Eсли пользователь выполняет поиск по стране (например, Canada), то все объявления, которые находится в Канаде, будут отображены на странице с объявлениями.
- Если пользователь ищет по городу (например, Toronto), то все объявления в городе Торонто появятся для пользовател.
- Если пользователь ищет определённый адрес, вместо этого ему будут показаны объявления для города, к которому относится этот адрес. Например, поиск выполнен по запросу "33 University Avenue", то есть по адресу, расположенному в центре Торонто, но на экране появятся объявления для города Торонто. Город - это наименьшая доступная для поиска единица, по которой приложение отображает информацию об объявлениях.
- Если попытаться запросить объявления, данные о которых не существуют в базе данных, то будет отображено сообщение, в котором говорится: "It appears that no listings have yet been created..." ("Похоже, что объявления ещё не были созданы...").

Пользователи могут искать объявления практически в любой части мира. Для этого они могут выполнить поисковый запрос, доступный как на домашней странице, так и в хедере приложения. Если пользователь не вводит в поле ввода ничего, кроме пустых пробелов, и пытается выполнить поиск, то ему отображается сообщение об ошибке.

Когда поиск выполнен, пользователь направляются на страницу с объявлениями, где он может просмотреть все объявления, созданные для определенного местоположения. При загрузке страницы и обработки запроса сервером, пользователю отображается _скелет_, который потом заполняется информацией. Если сервер по каким-либо причинам не может обработать запрос, то помимо скелета отображается баннер с ошибкой. На странице с объявлениями отображаются до восьми карточек с объявлениями. Реализована _пагинация_. Объявления можно _отсортировать по цене_: от самой низкой до самой высокой и наоборот. По умолчанию, объявления отсортированы по цене от самой низкой до самой высокой.

### 8. Бронирование объявлений

В обзоре конкретного объявления пользователи могут его забронировать на определенный период времени. Когда выбраны доступные даты бронирования, пользователю предлагается подтвердить бронирование, предоставив действительную платежную информацию, т.е. кредитную или дебетовую карту.

### 9. Обработка платежа с помощью Stripe

Для сбора платёжной информации от пользователей в приложении используется библиотека [Stripe Elements](https://stripe.com/payments/elements), которая представляет собой готовые UI-компоненты. Подробную информацию об этом процессе можно найти в [документации Stripe](https://stripe.com/docs/payments/accept-a-payment).

### 10. Просмотр истории созданных объявлений и сделанных бронирований

При авторизации в приложении и переходе на страницу своей учётной записи, пользователь может видеть историю всех созданных им объявлений, а также бронирований объявлений, созданных другими пользователями.

Когда пользователь просматривает подбробную информацию о принадлежащем ему объявлении, он может увидеть бронирования, которые сделали другие пользователи.

### 11. Просмотр истории объявлений, созданных другими пользователями

Пользователь, посещая персональную страницу другого пользователя, может просматривать объявления, созданные этим пользователем.

### 12. Отображаение объявлений премиум-класса на главной странице приложения

На домашней странице приложения пользователю представлены четыре объявления с самой высокой ценой.

Когда пользователь загружает домашнюю страницу, то, чтобы уменьшить дискомфорт от ожидания загрузки данных с сервера для отображения объявлений премиум-класса, ему отображается _макет секции под эти объявления (скелет)_. После получения ответа от сервера, скелет заменяется действительной информацией, а пользователю кажется, что всё происходит мгновенно.

Если запрос к серверу на получение данных по четырем самым дорогим объявлениями по каким-либо причинам не может быть выполнен, то данная секция пользователю не отображается. При этом пользователь всё ещё может просматривать информацию на главной странице.
