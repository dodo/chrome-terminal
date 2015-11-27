# chrome terminal

start console commands from the context menu of your browser.

# install

* First check it out and install dependencies like this:

```shell
git clone git://github.com/dodo/chrome-terminal.git
cd chrome-terminal
npm install .
```

* Goto `Chrome/chromium menu` > `Settings` > `Extensions`.
* Check `Developer mode` on.
* Click `Load unpacked extension…`
* Select `chrome-terminal` folder.
* Copy extension id and use it with this little script:

```shell
./install.sh <extensionId>
```

* Start adding commands via extension's `Options` to your context menu.
