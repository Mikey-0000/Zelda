import os
OUT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','public')
NAV=[('index','Home'),('Ocarina','Ocarina'),('Zelda','Zelda'),('Link','Link'),('Navi','Navi'),('Majoria',"Majora's Mask"),('Twilight','Twilight Princess'),('Skyward','Skyward Sword'),('Wild','Breath of the Wild'),('Ganondorf','Ganondorf')]
def page(name,title,theme,body):
    body=body.replace('</h1>','</h1>\n        ORN',1).replace('ORN','''<svg class="ornament" viewBox="0 0 480 28"><g fill="none" stroke="#b8860b" stroke-width="2"><path d="M10 14 H200 M280 14 H470"/><path d="M200 14 Q215 2 230 14 Q215 26 200 14Z M250 14 Q265 2 280 14 Q265 26 250 14Z"/></g><path d="M240 2 L252 22 H228Z" fill="#f4c542" stroke="#7a5a2a"/></svg>''')
    nav=''.join(f'<li><a href="{n}.html">{t}</a></li>' for n,t in NAV)
    html=f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>{title}</title>
    <link rel="stylesheet" href="style.css?v=9">
</head>
<body data-theme="{theme}">
    <main class="page">
{body}
    </main>
    <script src="script.js?v=9"></script>
</body>
</html>
'''
    open(f'{OUT}/{name}.html','w').write(html)
def nav():
    return '        <nav class="navbar"><ul class="nav-list">'+''.join(f'<li><a href="{n}.html">{t}</a></li>' for n,t in NAV)+'</ul></nav>\n'
def card(img,name,who,lines,alt):
    return f'''        <div class="card-wrap"><div class="card" title="Click me"><canvas width="480" height="640" data-img="{img}" data-who="{who}" data-lines="{lines}" aria-label="{alt}"></canvas><div class="hint">CLICK · HOVER</div></div></div>
'''


def media(p,col,title):
    lab=f'<rect x="14" y="16" width="52" height="30" rx="3" fill="{col}" stroke="#0006"/><path d="M14 40 L30 28 L42 38 L52 26 L66 40 V46 H14Z" fill="#0004"/><circle cx="54" cy="26" r="4" fill="#fff8"/>'
    if p.startswith('NES'):
        return f'<svg viewBox="0 0 80 84"><path d="M6 8 H74 V70 L66 80 H14 L6 70Z" fill="#c9a23a" stroke="#4a3208" stroke-width="3"/><rect x="12" y="12" width="56" height="42" rx="3" fill="#8a6a1c"/>{lab.replace("y=\"16\"","y=\"15\"")}<rect x="22" y="70" width="36" height="6" fill="#222"/></svg>'
    if p.startswith('SNES'):
        return f'<svg viewBox="0 0 80 84"><path d="M4 12 H76 V68 L68 78 H12 L4 68Z" fill="#b9b9c2" stroke="#3a3a44" stroke-width="3"/><path d="M4 12 H76 L72 22 H8Z" fill="#8a8a96"/>{lab}<rect x="20" y="70" width="40" height="5" fill="#222"/></svg>'
    if p.startswith('Game Boy'):
        return f'<svg viewBox="0 0 80 84"><path d="M10 6 H70 V64 L62 78 H18 L10 64Z" fill="#9a9aa4" stroke="#33333c" stroke-width="3"/><path d="M10 6 H70 V16 H10Z" fill="#7a7a86"/>{lab}<rect x="22" y="70" width="36" height="5" fill="#222"/></svg>'
    if p.startswith('Nintendo 64'):
        return f'<svg viewBox="0 0 80 84"><path d="M6 14 H74 V70 L66 80 H14 L6 70Z" fill="#8a8a92" stroke="#2a2a32" stroke-width="3"/><path d="M6 14 H74 L70 24 H10Z" fill="#666672"/>{lab}<rect x="22" y="72" width="36" height="5" fill="#222"/></svg>'
    if p.startswith('GameCube'):
        return f'<svg viewBox="0 0 80 84"><circle cx="40" cy="42" r="34" fill="#c8c0e8" stroke="#3a3560" stroke-width="3"/><circle cx="40" cy="42" r="30" fill="{col}" opacity=".9"/><circle cx="40" cy="42" r="10" fill="#e8e8f4" stroke="#3a3560" stroke-width="2"/><circle cx="40" cy="42" r="3" fill="#0a0a14"/></svg>'
    if p.startswith('Wii') or p.startswith('Switch / Wii U'):
        return f'<svg viewBox="0 0 80 84"><circle cx="40" cy="42" r="34" fill="#e8f0f8" stroke="#2a4a6a" stroke-width="3"/><circle cx="40" cy="42" r="30" fill="{col}" opacity=".85"/><circle cx="40" cy="42" r="10" fill="#fff" stroke="#2a4a6a" stroke-width="2"/><circle cx="40" cy="42" r="3" fill="#0a1424"/></svg>'
    return f'<svg viewBox="0 0 80 84"><rect x="20" y="4" width="40" height="76" rx="5" fill="#2a2a32" stroke="#000" stroke-width="3"/><rect x="25" y="10" width="30" height="36" rx="3" fill="{col}"/><path d="M25 38 L36 28 L44 36 L50 29 L55 36 V46 H25Z" fill="#0004"/><rect x="28" y="62" width="24" height="12" fill="#c8a24a"/></svg>'
COLS={'1986':'#d8a23a','1987':'#5a8ad8','1991':'#4aa86a','1993':'#d8c84a','1998':'#3a8a4a','2000':'#7a2a9a','2002':'#4ab8d8','2006':'#c87a3a','2011':'#6ac8f4','2017':'#7ac8a8','2023':'#4a9a8a'}

# ---------------- index ----------------
games=[
 ('1986','The Legend of Zelda','NES','The one that started it all: a top-down adventure of exploration and secrets, with a gold cartridge to match.',None),
 ('1987','Zelda II: The Adventure of Link','NES','A side-scrolling sequel with RPG-style experience and towns.',None),
 ('1991','A Link to the Past','SNES','Introduced the Light World and Dark World and set the template for many later games.',None),
 ('1993','Link\'s Awakening','Game Boy','Link washes ashore on Koholint Island and must wake the Wind Fish.',None),
 ('1998','Ocarina of Time','Nintendo 64','The first 3D entry. Z-targeting, time travel, and songs on the ocarina.','Ocarina.html'),
 ('2000','Majora\'s Mask','Nintendo 64','Three days to stop the falling moon in the land of Termina.','Majoria.html'),
 ('2002','The Wind Waker','GameCube','A cel-shaded sea adventure across a flooded Hyrule.',None),
 ('2006','Twilight Princess','GameCube / Wii','A darker tale where Link becomes a wolf in the Twilight Realm.','Twilight.html'),
 ('2011','Skyward Sword','Wii','The origin of the Master Sword, set in the skies above Hyrule.','Skyward.html'),
 ('2017','Breath of the Wild','Switch / Wii U','An open-air Hyrule you can explore in almost any order.','Wild.html'),
 ('2023','Tears of the Kingdom','Switch','Sky islands, the depths below, and the power to build and rewind.',None),
]
tl=''.join(f'<div class="g" data-title="{t}" data-text="{b}|Platform: {p}. Released {y}." {"data-link=%s"%chr(34)+l+chr(34) if l else ""}><div class="med">{media(p,COLS[y],t)}</div><div class="y">{y}</div><div class="t">{t}</div><div class="plat">{p}</div></div>' for y,t,p,b,l in games)
tl=tl.replace('data-link=""','')
index_body = nav() + f'''
        <h1>The Legend of Zelda: Ocarina of Time</h1>
        <svg class="tri" viewBox="0 0 100 90" role="img" aria-label="Triforce (click me)"><g fill="#f4c542" stroke="#b8860b" stroke-width="2"><path d="M50 2 L74 44 L26 44Z"/><path d="M26 46 L50 88 L2 88Z"/><path d="M74 46 L98 88 L50 88Z"/></g></svg>

        <h2>Overview</h2>

        <p>The Legend of Zelda: Ocarina of Time is an action-adventure video game developed by Nintendo and released in 1998 for the Nintendo 64. You play as Link, a young boy tasked with saving the land of Hyrule from the evil king Ganondorf. The game mixes exploration, puzzle-solving, and combat, and is widely regarded as one of the greatest video games of all time.</p>

        <p>Navi, the fairy companion of Link, is a key character in the game. She offers hints and advice on how to progress, and her catchphrase "Hey! Listen!" has become a memorable part of the game's legacy.</p>

        <p>Link, initially a young boy, embarks on a quest to save Hyrule from Ganondorf. His entire life, he believed he was a Kokiri, though it is later revealed that he is Hylian.</p>

        <p>The game is set in a 3D world, allowing players to explore forests, mountains, and dungeons. Players interact with non-playable characters (NPCs), solve puzzles, and defeat enemies to progress. The game also features a time-travel mechanic, where Link moves between his childhood and adulthood to complete different tasks.</p>

        <p>Ocarina of Time received critical acclaim for its innovative gameplay, immersive world, and memorable music. Its influence can be seen in many later Zelda titles and other action-adventure games.</p>

        <h2>Meet the Great Deku Tree</h2>
        <div id="deku-host"></div>
        <p style="text-align:center">Click the tree. Cut the grass at the bottom of the screen. Press <b>I</b> for your inventory. Find the hidden Gold Skulltula.</p>

        <h2>Characters &amp; Items</h2>
        <div class="gamegrid">
            <a href="Link.html">Link<span class="sub">The Hero of Time</span></a>
            <a href="Zelda.html">Zelda<span class="sub">Princess of Hyrule</span></a>
            <a href="Navi.html">Navi<span class="sub">The fairy who says “Hey! Listen!”</span></a>
            <a href="Ocarina.html">Ocarina<span class="sub">Play the songs yourself</span></a>
            <a href="Ganondorf.html">Ganondorf<span class="sub">The King of Evil</span></a>
            <a href="Wild.html">Breath of the Wild<span class="sub">A kingdom reborn</span></a>
        </div>

        <h2>The Wider Series</h2>

        <p>The Legend of Zelda franchise began in 1986 and has since expanded into a series of games, each with its own story and gameplay. Ocarina of Time was its first 3D entry, and it set the template for many games that followed. Other games you can explore:</p>

        <ul>
            <li><a href="Majoria.html">The Legend of Zelda: Majora's Mask (2000)</a></li>
            <li><a href="Twilight.html">The Legend of Zelda: Twilight Princess (2006)</a></li>
            <li><a href="Skyward.html">The Legend of Zelda: Skyward Sword (2011)</a>, set earlier in the timeline</li>
        </ul>


        <h2>Map of Hyrule</h2>
        <p style="text-align:center;margin-bottom:6px">An old traveller's chart. Click a region.</p>
        <div class="mapwrap"><svg viewBox="0 0 800 520" role="img" aria-label="Map of Hyrule">
          <defs><filter id="rough"><feTurbulence baseFrequency=".03" numOctaves="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="6"/></filter></defs>
          <rect width="800" height="520" fill="#d9c28a"/>
          <g filter="url(#rough)">
            <path d="M60 80 Q200 20 420 40 Q640 20 750 120 Q780 300 720 440 Q500 500 300 480 Q100 470 50 340Z" fill="#e8d7a8" stroke="#5a3f1a" stroke-width="4"/>
            <g class="region" data-who="Kokiri Forest" data-say="Home of the Kokiri, the forest children who never grow up. The Great Deku Tree watches over them."><path d="M70 330 Q110 260 200 290 Q240 350 190 420 Q110 440 70 330Z" fill="#4c8a4a" stroke="#1d5a1f" stroke-width="3"/><text x="105" y="365" font-family="Cinzel" font-size="14" fill="#10300f">Kokiri Forest</text></g>
            <g class="region" data-who="Hyrule Field" data-say="The wide open heart of Hyrule, linking every region. Lon Lon Ranch sits here, where Malon raises horses, including Epona."><path d="M260 200 Q380 160 480 210 Q520 300 440 350 Q320 370 260 300Z" fill="#9fbb6a" stroke="#4c6a2a" stroke-width="3"/><text x="320" y="285" font-family="Cinzel" font-size="15" fill="#2a3a10">Hyrule Field</text></g>
            <g class="region" data-who="Death Mountain" data-say="Home of the Gorons, who live in Goron City. Dodongo's Cavern lies within the mountain."><path d="M560 70 L620 40 L700 80 L720 180 L640 200 L570 160Z" fill="#8a6a4a" stroke="#3a2a15" stroke-width="3"/><path d="M580 150 L620 90 L660 150Z M640 160 L675 105 L705 160Z" fill="#c9ad72" stroke="#3a2a15"/><text x="570" y="205" font-family="Cinzel" font-size="14" fill="#2a1a08">Death Mountain</text></g>
            <g class="region" data-who="Zora's Domain" data-say="The icy waterfall home of the Zoras, source of Hyrule's river. Lord Jabu-Jabu is said to dwell here."><path d="M470 80 Q520 70 545 110 Q520 160 470 150Z" fill="#6aa8d8" stroke="#2a5a8a" stroke-width="3"/><text x="440" y="175" font-family="Cinzel" font-size="13" fill="#10304f">Zora's Domain</text></g>
            <g class="region" data-who="Lake Hylia" data-say="A vast lake in the south of Hyrule. In the adult era, the Water Temple lies hidden beneath it."><path d="M330 400 Q420 360 520 400 Q540 460 440 470 Q340 470 330 400Z" fill="#6aa8d8" stroke="#2a5a8a" stroke-width="3"/><text x="385" y="432" font-family="Cinzel" font-size="14" fill="#10304f">Lake Hylia</text></g>
            <g class="region" data-who="Gerudo Desert" data-say="A harsh desert in the west, ruled by the Gerudo. The Spirit Temple stands at the Desert Colossus."><path d="M80 130 Q120 80 230 90 Q260 150 220 200 Q130 220 80 130Z" fill="#e0c06a" stroke="#8a6a1a" stroke-width="3"/><text x="115" y="155" font-family="Cinzel" font-size="14" fill="#4a3208">Gerudo Desert</text></g>
            <g class="region" data-who="Kakariko Village" data-say="A quiet village at the foot of Death Mountain. Impa's house and the graveyard are here."><rect x="540" y="250" width="60" height="40" rx="4" fill="#a8744a" stroke="#3a2a15" stroke-width="3"/><path d="M535 252 L570 225 L605 252Z" fill="#7a1f1a" stroke="#3a2a15" stroke-width="2"/><text x="520" y="310" font-family="Cinzel" font-size="13" fill="#2a1a08">Kakariko Village</text></g>
            <g class="region" data-who="Temple of Time" data-say="In Hyrule Castle Town stands the Temple of Time, where the Master Sword waits behind the Door of Time."><path d="M330 120 L360 90 L390 120 V160 H330Z" fill="#c9c2d8" stroke="#3a3a55" stroke-width="3"/><path d="M345 160 V135 H375 V160Z" fill="#3a3a55"/><text x="300" y="82" font-family="Cinzel" font-size="13" fill="#20203a">Castle &amp; Temple of Time</text></g>
          </g>
          <g stroke="#7a1f1a" stroke-width="3" fill="none"><path d="M735 460 l0 -40 M735 420 l-10 14 M735 420 l10 14"/></g><text x="726" y="490" font-family="Cinzel" font-size="16" fill="#7a1f1a">N</text>
        </svg><div class="legend">Drawn for travellers of Hyrule</div></div>

        <h2>Franchise Timeline</h2>
        <p style="text-align:center;margin-bottom:0">Scroll sideways and click a game.</p>
        <div class="tl">{tl}</div>

        <h2>Pause Screen</h2>
        <div id="pause-live" class="pause-fig" aria-label="Ocarina of Time style item screen"></div><p style="text-align:center;font-size:1rem">Click any item. Press <b>I</b> to open your real inventory.</p>
        <p class="btnrow"><button class="btn" onclick="__hyrule.openInv()">Open Inventory</button> <button class="btn" data-trivia>Hyrule Trivia</button> <button class="btn" onclick="__hyrule.toggleNight()">Day / Night</button></p>

        <p>This page is an overview of the main characters and games in the series, starting with Ocarina of Time. It is a tribute to a timeless classic that has stood the test of time and continues to captivate players of all ages.</p>
'''
page('index','The Legend of Zelda: Ocarina of Time - An Encyclopedia','index',index_body)

# ---------------- Link ----------------
link_body = nav()+'''        <h1>Link - The Hero of Hyrule</h1>
'''+card('images/Link.jpeg','Link','Link','Hyaah!|I may not be a Kokiri... but this forest will always be my home.|Navi, where to next?','Link, young hero of Hyrule')+'''
        <p>Link is the protagonist of The Legend of Zelda: Ocarina of Time, a young boy who embarks on a quest to save the land of Hyrule from the evil king Ganondorf.</p>

        <p>Throughout the game, Link is guided by the fairy companion Navi, who provides hints and advice on how to progress through the story. Link's journey takes him through various environments, including forests, mountains, and dungeons, where he must solve puzzles, defeat enemies, and uncover the secrets of Hyrule's history.</p>

        <p>Link is known for his bravery, determination, and selflessness, as he faces numerous challenges and battles formidable foes to protect the land and its inhabitants. His iconic green tunic, pointed hat, and the Master Sword have become symbols of his heroism and courage.</p>

        <h2>Link's Journey</h2>

        <p>Link's journey begins in Kokiri Forest, where he is raised as a child among the Kokiri, a race of people who never grow up. He is the only one without a guardian fairy, which makes him feel like an outsider, until the fairy Navi is sent to him by the Great Deku Tree. The Deku Tree, who is dying from a curse, tells Link that an evil man is threatening Hyrule, and he sends him out into the world to stop it. After the Deku Tree dies, Link leaves the forest for the first time and travels to Hyrule Castle.</p>

        <p>There he meets Princess Zelda, who has had a prophetic dream about a dark storm and the rising power of Ganondorf, the leader of the Gerudo. She asks Link to collect the three Spiritual Stones, which are needed to open the Door of Time and reach the Triforce before Ganondorf can. Link earns the stones by helping the three peoples of Hyrule: the Kokiri's Emerald from the Great Deku Tree, the Goron's Ruby from Dodongo's Cavern, and the Zora's Sapphire from Jabu-Jabu's Belly.</p>

        <p>With the stones in hand, Link returns to the Temple of Time and pulls the Master Sword from its pedestal. Doing so seals him away for seven years, because he is too young to be the Hero of Time. In the meantime, Ganondorf uses the opened Door of Time to seize the Triforce of Power and conquers Hyrule, turning it into a wasteland.</p>

        <p>When Link wakes as an adult, he learns that he must awaken six Sages to seal Ganondorf away. He travels through the Forest, Fire, Water, Shadow, and Spirit Temples, with help from allies such as Sheik, who is really Zelda in disguise. Link can also travel back and forth in time by returning the Master Sword to its pedestal, which lets him use abilities and items from both his childhood and adulthood to solve puzzles.</p>

        <p>Once the Sages are awakened, Zelda is revealed to be the final Sage, but Ganondorf captures her just before the final confrontation. Link storms Ganon's Castle, fights through its trials, and defeats Ganondorf, who then transforms into the monstrous Ganon. Link defeats him with the help of Zelda and the Master Sword, and the Sages seal Ganon in the Sacred Realm. Zelda sends Link back to his childhood so he can live the years he lost, and he returns to the time before the war began.</p>

        <h2>Quest Items</h2>
        <p style="text-align:center">The three Spiritual Stones are in your inventory. Earn them by exploring, playing songs, and finding Skulltulas.<br><button class="btn" onclick="__hyrule.openInv()">Open Inventory</button></p>
'''
page('Link','Link - The Hero of Hyrule','index',link_body)

# ---------------- Zelda ----------------
zelda_body = nav()+'''        <h1>Zelda - The Princess of Hyrule</h1>
'''+card('images/Zelda.jpeg','Zelda','Princess Zelda','Link... the fate of Hyrule rests in your hands.|Take this. The Ocarina of Time. It will guide you.|The Triforce of Wisdom stirs within me. I can sense the evil.','Princess Zelda holding the Ocarina of Time')+'''
        <p>Zelda is the princess of Hyrule, a courageous and determined character who embarks on a quest to save the land from evil forces. She is known for her regal purple-and-white gown, long blonde hair, and the Triforce of Wisdom, which she wields with skill and precision. Throughout her journey, Zelda faces numerous challenges, battles formidable enemies, and uncovers the secrets of Hyrule's history. Her unwavering bravery and selflessness make her a beloved character in the gaming world.</p>

        <p>In The Legend of Zelda: Ocarina of Time, Zelda plays a crucial role in aiding Link on his quest to defeat Ganondorf and save Hyrule. She provides guidance and support to Link throughout his journey, offering wisdom and insight into the challenges he faces. Zelda's intelligence, resourcefulness, and determination make her an invaluable ally to Link as they work together to protect their kingdom from evil forces.</p>

        <p>She is also known for her ability to sense the presence of evil and her role in protecting the Triforce of Wisdom.</p>

        <p>In The Legend of Zelda: Ocarina of Time, she is a key figure in the story, often serving as a symbol of hope and resilience for the people of Hyrule.</p>

        <h2>Princess of Hyrule</h2>
        <p style="text-align:center">She taught Link the Song of Time. Play it on the <a href="Ocarina.html">Ocarina page</a>.<br><button class="btn" data-say="Hello, Link. I had a dream about a dark storm.|Please, gather the three Spiritual Stones." data-who="Princess Zelda">Speak to Zelda</button></p>
'''
page('Zelda','Zelda - The Princess of Hyrule','zelda',zelda_body)

# ---------------- Navi ----------------
navi_body = nav()+'''        <h1>Navi - The Fairy Companion</h1>
        <svg class="tri" style="width:120px" viewBox="0 0 120 120" role="img" aria-label="Navi"><defs><radialGradient id="ng"><stop offset="0" stop-color="#fff"/><stop offset=".4" stop-color="#9fe0ff"/><stop offset="1" stop-color="#9fe0ff00"/></radialGradient></defs><circle cx="60" cy="60" r="50" fill="url(#ng)"/><path d="M60 60 C20 20 10 60 40 70Z" fill="#ffffffaa"/><path d="M60 60 C100 20 110 60 80 70Z" fill="#ffffffaa"/><circle cx="60" cy="60" r="9" fill="#fff"/></svg>

        <p>Navi is the fairy companion of Link in The Legend of Zelda: Ocarina of Time. Sent by the Great Deku Tree to the boy who had no fairy, she becomes his guide, offering hints and advice on how to progress. Her catchphrase, "Hey! Listen!", has become part of the game's legacy.</p>

        <h2>How Navi Helps</h2>
        <ul>
            <li>She glows blue as she flutters beside Link, and turns yellow when something nearby has caught her attention.</li>
            <li>She powers Z-targeting: lock onto an enemy or a person and Link keeps them in view.</li>
            <li>She offers hints about enemies, puzzles and where to go next.</li>
            <li>At the end of the adventure, she says goodbye to Link and flies away.</li>
        </ul>

        <h2>Other Zelda Companions</h2>
        <ul>
            <li>Tatl, the fairy who joins Link in <a href="Majoria.html">Majora's Mask</a>.</li>
            <li>Midna, who helps Link in <a href="Twilight.html">Twilight Princess</a>.</li>
            <li>Fi, the spirit of the sword in <a href="Skyward.html">Skyward Sword</a>.</li>
        </ul>

        <p style="text-align:center">The glowing fairy following your cursor is Navi too. Click her for a hint.<br><button class="btn" data-say="Hey! Listen!|Hey! Listen!|...Hey! Listen!" data-who="Navi">Hey!</button></p>
'''
page('Navi','Navi - The Fairy Companion','navi',navi_body)

# ---------------- Ocarina ----------------
oc_body = nav()+'''        <h1>The Ocarina of Time</h1>

        <p>The ocarina is a small wind instrument at the heart of Ocarina of Time. Link first receives the Fairy Ocarina from his friend Saria, and later the Ocarina of Time, entrusted to him by Princess Zelda. By playing short melodies he learns along the way, Link can call his horse, change the time of day, summon storms and open the way forward.</p>

        <h2>Play It Yourself</h2>
        <p style="text-align:center;margin-bottom:0">Play the six-note songs. Each new song you discover earns a Piece of Heart, and some of them change the world around you.</p>
        <div id="ocarina-ui" class="ocarina"></div>

        <h2>Songs</h2>
        <ul>
            <li>Zelda's Lullaby: taught by Impa. Rains hearts.</li>
            <li>Epona's Song: taught by Malon. A horse runs past.</li>
            <li>Saria's Song: taught by Saria. Leaves drift down.</li>
            <li>Sun's Song: taught by the Composer Brothers. Switches day and night.</li>
            <li>Song of Time: taught by Zelda. Time stands still for a moment.</li>
            <li>Song of Storms: taught by Guru-Guru. Brings rain and thunder.</li>
        </ul>
'''
page('Ocarina','The Ocarina of Time','ocarina',oc_body)

# ---------------- Majora ----------------
masks=[('Deku Mask','Turns Link into a Deku Scrub. He can shoot bubbles and hop across water.'),('Goron Mask','Turns Link into a Goron. He can roll at high speed and punch hard.'),('Zora Mask','Turns Link into a Zora. He can swim fast and throw his fins like boomerangs.'),('Fierce Deity Mask','A powerful mask that turns Link into a mighty warrior, usable in boss fights.'),('Bunny Hood','Makes Link run faster.'),('Great Fairy Mask','Draws stray fairies toward Link.')]
MASKSVG={
'Deku Mask':'<path d="M32 6 Q40 14 46 8 Q44 20 46 26 Q50 40 40 54 Q32 60 24 54 Q14 40 18 26 Q20 20 18 8 Q24 14 32 6Z" fill="#8a5a2a" stroke="#2a1708" stroke-width="2.5"/><path d="M32 6 Q26 0 20 4 Q26 10 32 12Z M32 6 Q38 0 44 4 Q38 10 32 12Z" fill="#3f9a3a" stroke="#13300f" stroke-width="1.5"/><path d="M22 28 L30 31 M42 28 L34 31" stroke="#1a0d05" stroke-width="3" stroke-linecap="round"/><circle cx="26" cy="31" r="2" fill="#ffd24a"/><circle cx="38" cy="31" r="2" fill="#ffd24a"/><path d="M26 46 Q32 50 38 46" stroke="#1a0d05" stroke-width="3" fill="none"/>',
'Goron Mask':'<path d="M10 24 Q12 8 32 8 Q52 8 54 24 Q58 44 44 54 Q32 60 20 54 Q6 44 10 24Z" fill="#b8663a" stroke="#3a1a08" stroke-width="2.5"/><path d="M8 20 L2 12 L12 14Z M56 20 L62 12 L52 14Z" fill="#8a4a22" stroke="#3a1a08" stroke-width="2"/><path d="M16 26 Q24 20 30 28 M48 26 Q40 20 34 28" stroke="#3a1a08" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="23" cy="31" r="3" fill="#fff"/><circle cx="41" cy="31" r="3" fill="#fff"/><circle cx="23" cy="31" r="1.4" fill="#000"/><circle cx="41" cy="31" r="1.4" fill="#000"/><path d="M22 46 Q32 52 42 46" stroke="#3a1a08" stroke-width="3" fill="none"/>',
'Zora Mask':'<path d="M32 4 Q50 10 52 30 Q52 50 32 60 Q12 50 12 30 Q14 10 32 4Z" fill="#5a9ad8" stroke="#10284a" stroke-width="2.5"/><path d="M12 28 L2 22 L6 38Z M52 28 L62 22 L58 38Z" fill="#9dc3fc" stroke="#10284a" stroke-width="2"/><path d="M32 6 V22" stroke="#cfe6ff" stroke-width="4"/><ellipse cx="23" cy="31" rx="4" ry="3" fill="#fff"/><ellipse cx="41" cy="31" rx="4" ry="3" fill="#fff"/><circle cx="23" cy="31" r="1.6" fill="#000"/><circle cx="41" cy="31" r="1.6" fill="#000"/><path d="M18 46 H46 M20 50 H44" stroke="#10284a" stroke-width="2"/>',
'Fierce Deity Mask':'<path d="M32 4 Q52 8 54 28 Q54 48 32 60 Q10 48 10 28 Q12 8 32 4Z" fill="#e8e4f0" stroke="#201830" stroke-width="2.5"/><path d="M32 6 L26 0 M32 6 L38 0 M12 20 L2 14 M52 20 L62 14" stroke="#201830" stroke-width="3" stroke-linecap="round"/><path d="M14 26 L28 32 M50 26 L36 32" stroke="#c0281f" stroke-width="5" stroke-linecap="round"/><path d="M20 40 L32 52 L44 40" stroke="#2a50b8" stroke-width="4" fill="none"/><circle cx="32" cy="22" r="3" fill="#c0281f"/>',
'Bunny Hood':'<path d="M22 26 Q10 8 16 2 Q24 8 28 22Z M42 26 Q54 8 48 2 Q40 8 36 22Z" fill="#f0e6c8" stroke="#4a3208" stroke-width="2.5"/><path d="M12 36 Q12 22 32 22 Q52 22 52 36 Q52 54 32 58 Q12 54 12 36Z" fill="#f0e6c8" stroke="#4a3208" stroke-width="2.5"/><circle cx="24" cy="36" r="4" fill="#c0281f"/><circle cx="40" cy="36" r="4" fill="#c0281f"/><circle cx="32" cy="46" r="2.5" fill="#e07a8a"/><path d="M26 50 Q32 54 38 50" stroke="#4a3208" stroke-width="2" fill="none"/>',
'Great Fairy Mask':'<path d="M32 8 Q48 10 50 28 Q50 46 32 58 Q14 46 14 28 Q16 10 32 8Z" fill="#f4b6d0" stroke="#6a1a4a" stroke-width="2.5"/><path d="M14 28 Q0 20 4 6 Q16 8 18 22Z M50 28 Q64 20 60 6 Q48 8 46 22Z" fill="#ffd0ec" stroke="#6a1a4a" stroke-width="2"/><path d="M22 28 Q26 24 30 28 M34 28 Q38 24 42 28" stroke="#6a1a4a" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M26 44 Q32 50 38 44" stroke="#c0281f" stroke-width="3" fill="none"/><circle cx="32" cy="18" r="3" fill="#ffe45a" stroke="#6a1a4a"/>'}
mk=''.join(f'<button class="mask" data-name="{n}" data-text="{t}"><svg viewBox="0 0 64 64">{MASKSVG[n]}</svg><span>{n}</span></button>' for n,t in masks)
maj_body = nav()+f'''        <h1>The Legend of Zelda: Majora's Mask</h1>
        <p>Majora's Mask is an action-adventure game released in 2000 for the Nintendo 64 as the direct follow-up to Ocarina of Time. Link, searching for a lost friend, is drawn into the parallel world of Termina, where a mischievous Skull Kid wearing a cursed mask has set the moon on a collision course with Clock Town.</p>

        <h2>Three Days</h2>
        <p>The game runs on a three-day countdown. Link must play the Song of Time to return to the dawn of the first day, keeping what he has learned and resetting the world. Residents of Clock Town follow their own schedules, and helping them is as important as clearing dungeons.</p>

        <h2>Masks</h2>
        <p>Masks are the game's signature feature. Some turn Link into a different being, while others give small abilities. Tap one to learn what it does.</p>
        <div class="maskgrid">{mk}</div>

        <h2>Termina</h2>
        <ul>
            <li>Clock Town, the central hub, with its giant clock tower.</li>
            <li>Woodfall, Snowhead, Great Bay and Stone Tower: the four regions beyond the town.</li>
            <li>The Happy Mask Salesman, a strange merchant with a connection to the cursed mask.</li>
            <li>Tatl, a fairy who accompanies Link through the game.</li>
        </ul>
        <p style="text-align:center"><a href="index.html">Back to Ocarina of Time</a></p>
'''
page('Majoria',"The Legend of Zelda: Majora's Mask",'majora',maj_body)

# ---------------- Twilight ----------------
tw_body = nav()+'''        <h1>The Legend of Zelda: Twilight Princess</h1>
        <p>Twilight Princess is a 2006 action-adventure game for the GameCube and Wii. Link is a ranch hand in the peaceful Ordon Village until a shadowy force draws him into a darker version of Hyrule, where he takes the form of a wolf.</p>

        <h2>Wolf Link</h2>
        <p style="text-align:center">In the Twilight Realm, Link becomes a wolf with heightened senses. Wolf Link can dig, track scents and see spirits. <br><button class="btn" data-howl>Howl</button></p>

        <h2>Characters</h2>
        <ul>
            <li>Midna, an imp-like being of the Twilight Realm who becomes Link's guide and ally.</li>
            <li>Princess Zelda, who rules a Hyrule threatened by the encroaching twilight.</li>
            <li>Zant, the usurper who rules the Twilight Realm and wants to conquer Hyrule.</li>
            <li>Ganondorf, the Gerudo king whose ambition returns to threaten the land.</li>
        </ul>

        <h2>The Story in Brief</h2>
        <p>Link sets out to rescue the children of Ordon Village and uncover the source of the twilight. Along the way he works with Midna to restore the Fused Shadows and the Mirror of Twilight, learning that the fate of both worlds hangs on the choices of a few.</p>
        <p style="text-align:center"><a href="index.html">Back to Ocarina of Time</a></p>
'''
page('Twilight','The Legend of Zelda: Twilight Princess','twilight',tw_body)

# ---------------- Skyward ----------------
sk_body = nav()+'''        <h1>The Legend of Zelda: Skyward Sword</h1>
        <p>Skyward Sword is a 2011 action-adventure game for the Wii. Set earlier in the series timeline than any other game, it follows a young Link and Zelda from Skyloft, a town on islands floating above the clouds, and tells how the Master Sword came to be.</p>

        <h2>Above the Clouds</h2>
        <p style="text-align:center">Skyloft's residents ride giant Loftwings through the sky and dive down to the surface world. <br><button class="btn" data-dive>Take the Plunge</button></p>

        <h2>Key Ideas</h2>
        <ul>
            <li>Motion controls: Link swings his sword in the direction the player swings the Wii Remote.</li>
            <li>Fi, the spirit inside the sword, who guides Link.</li>
            <li>Ghirahim, a flamboyant villain who serves the demon king Demise.</li>
            <li>The Master Sword is forged here, and the long chain of events leading to Ganondorf begins.</li>
        </ul>
        <p style="text-align:center"><a href="index.html">Back to Ocarina of Time</a></p>
'''
page('Skyward','The Legend of Zelda: Skyward Sword','skyward',sk_body)

# ---------------- Ganondorf ----------------
gn_body = nav()+'''        <h1>Ganondorf - The King of Evil</h1>
        <p>Ganondorf is the long-standing villain of the Zelda series. In Ocarina of Time he is the leader of the Gerudo, a tribe of desert thieves, and the only male of his kind born in a hundred years. Appearing at first as a loyal servant, he schemes to seize the Triforce and rule Hyrule.</p>

        <h2>The Triforce of Power</h2>
        <p>By following Link into the Sacred Realm, Ganondorf lays hands on the Triforce and claims the Triforce of Power. The sacred relic splits into three, with Zelda and Link keeping the Triforces of Wisdom and Courage. Armed with the Triforce of Power, he conquers Hyrule and becomes the monstrous Ganon.</p>

        <h2>Across the Series</h2>
        <ul>
            <li>He returns in many games, often as Ganon or as Ganondorf.</li>
            <li>In <a href="Twilight.html">Twilight Princess</a>, his ambitions return to threaten Hyrule again.</li>
            <li>In <a href="Wild.html">Breath of the Wild</a>, his malice lives on as Calamity Ganon.</li>
        </ul>
        <p style="text-align:center"><button class="btn" data-say="Hmph... You think you can stand against me?|The Triforce of Power is mine, boy!" data-who="Ganondorf">Face Ganondorf</button></p>
'''
page('Ganondorf','Ganondorf - The King of Evil','ganon',gn_body)

# ---------------- Wild ----------------
wd_body = nav()+'''        <h1>The Legend of Zelda: Breath of the Wild</h1>
        <p>Breath of the Wild is an open-world adventure released in 2017 for the Nintendo Switch and Wii U. Link wakes in the Shrine of Resurrection after a long sleep and must free Hyrule from Calamity Ganon, with the help of the memories and spirits of the Champions.</p>

        <h2>A Kingdom Reborn</h2>
        <ul>
            <li>An open world you can climb, glide over and explore in almost any order.</li>
            <li>The Sheikah Slate, a tablet that gives Link abilities and a map.</li>
            <li>120 shrines and hundreds of Korok seeds hidden across Hyrule.</li>
            <li>Four Divine Beasts: Vah Ruta, Vah Rudania, Vah Medoh and Vah Naboris.</li>
            <li>Four Champions: Mipha, Daruk, Revali and Urbosa.</li>
        </ul>
        <p style="text-align:center"><button class="btn" data-say="Yahaha! You found me!|Here, have a Korok seed." data-who="Korok">Find a Korok</button></p>
'''
page('Wild','The Legend of Zelda: Breath of the Wild','wild',wd_body)
print('ok')
