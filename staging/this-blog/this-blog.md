{
  "title": "This Blog",
  "subtitle": "This is a subtitle, it better look like one! Okay a little big and why is it in the top corner?",
  "desc": "about this blog",
  "published": true,
  "dateEdited": 1701279650660,
  "datePosted": 1609522859000
}
<!--# START POST #-->
<style type="text/css">
    #procon > li > ul > li {
        color: darkred;
    }
    #procon > li > ul > li:nth-child(1) {
        color: green;
    }
    #procon > ul > li {
        color: darkkhaki;
    }
    #procon > li > ul > ul > li {
        color: darkkhaki;
    }
</style>

<h2>The Blog</h2>
            <p>This blog has gone through many stages, both appearance-wise, and back-end deployment.</p>
            <p>The previous theme I made for this site was meant to resemble my iTerm environment as accurately as possible; same tmux panes, same colors, same font, same "shell". The pages were styled exactly as how <a href="https://github.com/charmbracelet/glow" target="_blank">glow</a> (a CLI markdown reader) styled its output. I liked it for a while, but its quirks were rather cumbersome for anyone who didn't spend all day looking at my terminal, which, as it turns out, is most people.</p>
            <p>As for the static site generator used, well... that has changed a lot over time:</p>
            <ol id="procon">
                <li>Just me, Sublime Text 2, and the MDN HTML reference
                    <ul>
                        <li>Pros:</li>
                            <ul>
                                <li>???</li>
                            </ul>
                        <li>Cons:</li>
                            <ul>
                                <li>Most things</li>
                            </ul>
                    </ul>
                </li>
                <li>The Newbie favorite, <u>Jekyll</u>
                    <ul>
                        <li>Pros:</li>
                            <ul>
                                <li>Happily works with GitHub Pages</li>
                                <li>Would probably be cool if I ever got it working</li>
                            </ul>
                        <li>Cons:</li>
                            <ul>
                                <li>I never got it to build (looking back, it was probably a compatibility issue with fish shell)</li>
                            </ul>
                    </ul>
                </li>
                <li>Custom Python Solution
                    <ul>
                        <li>Pros:</li>
                            <ul>
                                <li>Handmade :)</li>
                                <li>GitHub Actions handled all the actual running of Python</li>
                            </ul>
                        <li>Cons:</li>
                            <ul>
                                <!-- <li>Messy</li> -->
                                <li>Was bad at its job</li>
                                <li>Hard to look at</li>
                                <li>Was really just bunch of strings concat'ed together with a markdown converter squashed in the middle</li>
                                <li>Used up my free GitHub Actions runtime</li>
                            </ul>
                    </ul>
                </li>
                <li>Got tired of python spaghetti and decided to give <u>11ty</u> a try
                    <ul>
                        <li>Pros:</li>
                            <ul>
                                <li>Would probably be cool if I ever got it working as intended</li>
                            </ul>
                        <li>Cons:</li>
                            <ul>
                                <li>I like GitHub pages, 11ty doesn't</li>
                                <li>Also used up all my GitHub Actions runtime credit</li>
                            </ul>
                    </ul>
                </li>
                <li>Write into the WikiJS editor on my private blog -> right click -> inspect element -> copy -> paste
                    <ul>
                        <li>Pros:</li>
                            <ul>
                                <li>Based</li>
                                <li>WikiJS does a good job with code formatting and markdown converting</li>
                            </ul>
                        <li>Cons:</li>
                            <ul>
                                <li>hahahaha</li>
                            </ul>
                    </ul>
                </li>
                <li>Custom solution in NodeJS.
                    <ul>
                        <li>Pros:</li>
                            <ul>
                                <li>Literally just used all the libraries WikiJS used, thrown into my own node project</li>
                                <li>Brought in Nunjucks for some easy-to-update templating</li>
                                <li>Actually somewhat robust?</li>
                            </ul>
                        <li>Cons:</li>
                            <ul>
                                <li>Have to install Node.</li>
                            </ul>
                    </ul>
                </li>
            </ol>
            <br>