![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![ASP.NET Core](https://img.shields.io/badge/ASP.NET%20Core-.NET%2010-blueviolet)

```
⠀⠀⠀⠀⠀⠀⠀⢠⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⣀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢀⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⡀⠀⠀⠀
⠀⠀⠀⠀⣼⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⡄⠀⠀
⠀⠀⣰⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⠀⠀
⠀⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⣿⣿⣿⠿⢛⠛⠉⠉⠙⠛⠛⢿⢿⣿⣿⡿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡄⠀
⣸⣿⣿⣿⣿⣿⡿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⢉⡱⡪⠋⠑⠀⠀⡠⣄⠀⠀⢶⢆⢀⠈⠊⢣⡀⢄⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⢻⣿⡇⢸⣿⣿⡟⢹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⢠⡃⢔⠄⠀⠐⣀⡴⠀⠁⡀⡠⠀⠈⠪⡳⣀⠑⣪⠯⠵⣻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡏⢻⣿⣿⡇⢸⠉⣿⣿⣿
⣿⣿⣿⣿⠈⢿⡇⢘⣿⣿⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠦⡘⢂⠂⢀⣑⠆⠀⠀⠀⡰⠡⣁⠀⠀⠘⠵⠂⠰⠻⣧⠹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡄⢹⣿⠃⣾⠀⣿⣿⢻⣿
⣿⡙⠿⣿⣇⠸⣿⠀⣿⡏⢨⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⣄⠙⠁⠀⢀⠇⠀⡠⣐⠖⠁⠀⠁⢨⡐⡀⠈⣿⠁⡗⢫⡡⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⠈⠿⡇⢸⠀⣿⠇⣸⣿
⣿⣿⣦⡙⡿⠀⠉⠀⠉⠀⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⢈⣄⠀⢸⣿⣔⠮⠏⠹⡤⠀⠀⡐⡩⠈⠝⡰⣜⠀⢹⣹⠣⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠁⠀⠀⠑⢺⣿⣿⣿
⣿⣿⣿⡇⠀⠀⠀⠀⠀⠬⡿⠟⠛⠻⣿⣿⣿⣟⡛⠛⠛⡛⠁⣈⡻⠀⠈⠛⠠⡔⢶⢶⠄⠀⠀⠃⢴⢾⠛⡤⠸⡀⡏⣮⣁⠉⣉⠿⠿⣛⣿⣿⣿⣿⡿⢋⠉⠛⠄⠄⠀⡀⠀⠚⣿⣿⣿
⣿⣿⣿⡇⠀⠀⠀⠀⠀⢀⢐⣶⣾⣿⣿⣿⣿⣿⣿⣷⣮⡤⢀⠠⢠⣶⠀⢲⠇⠈⠁⠁⠀⠀⠠⠀⠀⠉⠈⠀⢤⢤⢓⠿⢔⣡⣴⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⡀⠀⠠⠈⢀⠂⣿⣿⣿
⣿⣿⣿⣿⡀⠀⠠⠄⢂⣴⣿⣿⣿⣿⡿⣟⣿⣯⣿⣿⣿⡇⠀⠫⡔⠿⠧⣈⣝⠄⠀⠀⡀⠀⠀⢀⠀⠀⠀⠴⣗⣮⣾⣻⡷⡘⣿⣿⣿⢿⣿⣯⣿⣟⣿⡿⣿⣿⣿⡆⠀⠀⠀⢸⣿⣿⣿
⣿⣿⣯⣿⡇⠀⠀⠀⢸⣿⡿⣿⣽⣾⣿⣿⣿⣻⣟⣿⣾⢡⠀⢠⡟⣹⡗⣿⣷⡁⠀⠀⠈⠠⠄⠐⠀⢀⢈⣼⣷⡇⢃⣿⡧⣑⣻⣿⡿⣿⣯⣿⣟⣿⣿⢿⣟⣯⣿⣇⠀⠈⡀⢸⣿⣿
⣿⣷⢿⠛⠁⠀⠀⣀⣸⢻⣿⢿⣯⣿⣷⢿⣻⣟⣿⣯⡏⣄⡀⠀⠱⢩⠓⣻⣿⡿⣶⢠⣀⠀⠀⢀⢴⣷⣿⡿⡇⢏⣼⡸⡥⡙⣮⢿⣿⣻⣽⣿⣻⣿⣾⢿⣿⣻⡇⠈⠐⡀⠤⠤⠎⣿
⡏⠋⠒⠋⠁⠉⠀⢡⢣⠛⣿⡿⣯⣷⢿⣟⣿⣯⣿⣽⡧⢇⢂⠀⠐⠡⢳⠸⣿⣿⠙⢓⣲⡻⠟⠷⠚⠯⣿⣿⠰⣣⠶⡑⢦⣷⡸⣿⣿⣻⣟⣷⣿⣻⣾⢿⡷⣿⠇⠄⡀⠀⠀⠀⠘⣿
⣇⠀⠀⣀⠀⠤⠐⣀⢥⢞⣿⣟⡿⣽⣯⢿⣳⣯⠟⠎⠃⠈⠘⠱⣀⠀⠒⠱⣹⢛⡄⠛⣃⣈⣐⡀⢀⢤⣟⢿⣓⠃⣰⡼⡫⠂⠁⠀⠉⠛⢻⣽⡾⣿⡽⣟⣿⣽⡄⡁⠂⠩⠀⢀⣛⣿
⣷⠀⠐⠒⠂⢈⡡⠜⠊⢹⣟⣾⣟⡷⣯⢿⠏⠈⠀⠀⠀⠀⠀⠀⡌⠴⠄⠈⠴⠎⢆⡽⣐⣠⠖⡄⣭⡬⠆⣌⠂⠰⡬⡍⢀⠔⠀⠂⠀⠀⠀⠈⠛⠷⠿⣯⡿⣞⡇⠀⠁⠐⠠⠀⠧ ⣿
⡿⡇⠀⠉⠁⠀⠈⠈⠀⠸⣟⡾⡽⠏⠋⢠⣀⣂⣐⠀⠀⠀⠀⠀⡇⢘⢃⠀⠆⡛⠀⠯⡃⣯⠀⠒⢩⠇⢄⡈⠀⠆⣵⠠⠁⠀⢆⠀⠀⠀⠀⠄⠐⠀⠈⠑⢺⢟⣇⠀⢠⡀⠀⠀⠀   ⣿
⣿⣷⠀⠀⠀⠀⠀⠀⠀⠀⢿⣷⢃⢦⡘⡃⡴⢠⠀⠀⠀⠀⠀⠀⠀⠀⡾⠀⢀⣿⣷⡿⢸⡶⠆⠀⠞⡸⠸⢠⠀⢸⡀⠇⠀⠀⢰⢠⡀⠀⠀⠀⢠⣦⠆⢘⢆⡞⡆⡄⠀⡰⡀⠀⠀    ⣿
⣿⣿⠆⠀⠀⠀⠀⠀⠀⠀⢘⣿⣿⣿⢇⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇⠀⢸⢙⣿⡇⣼⣷⣶⣾⣷⠃⣧⠀⠀⡌⣿⠀⠀⠀⠀⡄⠁⢀⠀⠀⠃⠁⡜⡌⢾⣇⠁⣤⠀⢡⢡⠀⠀   ⣿⣿
⣿⣿⡞⡀⠀⠀⠀⠀⠀⠀⡜⡿⢿⣽⣯⢠⣆⠀⠀⠀⡆⠀⠀⠀⠀⡆⣇⠀⠰⣸⣿⡃⣏⣉⣉⣉⣁⡆⣿⠇⢀⣡⣿⠀⠀⠀⠀⢁⠀⠈⠳⣄⠀⡜⡘⡜⣦⠹⡳⣄⠀⠈⡄⠀⢀  ⣿⣿
⣿⣜⣇⠁⠀⠀⠀⠠⠀⡰⠁⠃⠞⣟⠐⣂⠉⡠⠀⠀⠁⠀⠀⠀⠀⠀⢸⠀⣆⣿⣸⢳⣿⣿⣽⣫⠿⢥⢻⣤⢺⢹⢼⡀⠀⠀⠀⠈⠀⠀⠀⠈⡀⠠⣱⠁⡜⡐⠅⠉⠂⠀⠁⠀⢸⣿⣿⣿
⣿⡵⣞⠀⠀⠀⠀⢀⠄⠀⠀⠀⠀⠙⣆⡠⢮⠀⠀⠈⠀⠀⠀⠀⠀⢰⠆⠀⡍⡘⡋⣘⠀⢀⣀⣀⣀⣀⡄⢢⢂⠎⡃⠈⠀⠀⠀⠀⠃⠀⢀⠔⠐⣰⣇⡀⠈⠂⠐⠠⠀⠉⠁⢀⡾⣿⣿⣿
⣿⣟⠛⠓⠒⠲⠤⠤⣤⡤⣤⢴⡲⢮⡙⢾⣡⢳⡀⠃⠀⠀⠀⠀⠀⠊⠰⠄⠝⠆⠁⡿⠿⠿⠽⠿⠿⠽⢧⠀⠄⠞⠫⠀⠀⠀⠀⠀⢈⠔⡡⡠⢞⢝⠡⣭⣿⣿⡷⣶⣿⡯⡯⣥⣽⣿
⣿⣿⣿⣿⣷⣷⣿⣿⣿⣿⣿⣮⣹⣎⡞⣢⢙⠪⠼⠢⠀⠀⠀⠀⠀⠀⠀⠈⢳⠘⢸⣀⣈⣀⣂⣠⣢⣄⣀⡄⠠⠰⠀⠀⠀⢀⠠⢂⠁⡠⠊⡀⡕⣭⣿⣿⢿⢭⣎⣿⣯⣯⣿⣿⣹⣿
⣿⣿⣷⣿⣿⡿⣿⣿⣿⣿⣽⣿⣷⣦⢻⣦⣏⢵⡠⣀⠢⢁⠂⠄⡀⠀⠀⠀⡀⡄⡸⢿⠻⠛⠟⠛⠓⠋⠛⠳⠀⠆⠢⠄⢂⠡⢐⠅⢊⡠⢮⣿⣾⣿⣿⣿⣿⣿⣟⣿⣿⣷⣟⣷⣝
⣿⣿⣿⣿⣿⣿⣷⣿⣿⣿⣿⣿⣿⣿⣮⢿⣿⣷⣮⣕⣣⢆⣌⡐⠀⠅⡐⠒⠠⢀⠇⠈⠤⡄⠤⠖⠀⠀⠀⣄⣁⠈⢒⡨⠔⣎⠥⣒⣧⣿⣿⣿⣿⣿⣿⣿⣽⣿⣷⣿⣽⣟⣾⣽⣝
⣿⣿⡿⣿⣿⣿⣿⣿⣿⣟⣿⣿⣿⣿⣿⣯⢿⣿⣿⣿⣿⣿⣶⣾⣈⣰⣦⣤⡀⢼⣶⣾⡞⠾⢿⣾⣾⣷⣷⣶⣶⣹⣶⣵⣤⣾⣿⣿⣿⣿⣿⣿⣿⣿⣯⡿⣿⣟⣿⣽⣿⣿⣿⣹⡟
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡞⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢇⡼⣿⣿⣿⣿⣿⣿⣿⣷⣿⣿⣿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣿⣿⣿⣿⣿⣻⣿⣿⣿⣯
⣿⣿⣿⣿⣿⣻⣿⣿⣿⣿⡿⠿⠿⠻⠿⠿⠿⢭⠟⠻⣿⣿⣿⣿⣿⣿⣿⣗⣻⢿⣿⣿⣽⣿⣿⣿⣿⣿⣿⣿⣿⣞⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣯⣯⣿⣽⣯⣿⣿⣿⣿⣷
⣿⣿⣏⣿⡿⣾⣿⣿⣿⣿⣦⣤⡀⠀⠀⠀⢀⣯⡀⢀⣼⡿⣝⢯⣿⣿⡿⡯⣈⠀⣿⣿⣿⣿⣿⣿⣿⣿⣽⣿⣿⣿⡇⠸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣿⣿⣿⣯⣿⣯⣿⣿⣟⣯⣿
⣿⣟⡯⣿⣿⣿⣿⣿⣿⣿⢻⣿⡇⠀⢸⣿⣿⣿⣿⣿⣫⠋⡀⠀⠈⢿⣯⣿⣧⠀⠙⠀⢰⣿⡟⠀⢀⣄⠀⣻⣿⠛⠃⠀⠋⢹⣿⣿⣿⣿⣿⣿⣿⣿⡿⣟⣿⣿⣟⣟⣯⣿⣿⣟⣿⣿
⣻⣿⣷⣿⣿⣿⣿⣿⣿⣟⢻⣿⡇⠀⢸⣿⣿⣯⠀⢺⠝⠀⢰⣻⣷⢮⣿⣿⣿⠀⠀⠰⣿⣿⡇⠀⠒⠛⢀⣷⣿⣶⣔⠀⣤⣼⣿⣿⣿⣿⣿⣿⣿⣿⠿⣿⣷⣿⣿⡿⣿⣿⣿⣿⣿⣿
⣿⣿⣷⣿⣿⣿⣿⣿⣿⣿⣿⣿⣇⠀⣿⣿⣿⣿⠀⢘⢉⡀⠈⢿⠏⢁⣿⣿⣿⠀⣤⣀⠀⢿⣇⠀⠛⠻⠿⢻⣿⣯⣇⠀⣿⣿⣿⣿⣿⣼⣯⣻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣽⣿⣇⢀⣿⣿⣿⣻⣠⣘⡬⣓⣄⣤⢶⡿⡿⡿⣧⡄⣿⣿⣿⣿⣷⣶⣶⣶⣿⣿⣿⣿⣿⣷⣿⡯⣿⣿⣿⣿⣿⡽⣿⣿⣿⣷⣿⣿⣯⣿⣿⣿⡿⣮⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣾⣿⣿⣿⣿⣿⡯⣿⡃⠀⠀⣀⣀⣀⣇⠁⢨⣿⢺⠿⣿⢻⠻⣿⢛⡏⣿⣿⢻⡿⢻⡟⢿⣿⣿⣿⣿⣿⣿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣻⡿⢿⣿⣭⣿
⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢿⡷⡒⠀⠀⣿⣿⣿⣿⠀⢰⣾⣿⣷⡿⠛⠻⣿⣿⡿⠛⣿⣿⣷⣿⠛⣿⢿⣿⡇⢸⣿⣿⢿⣿⣿⣿⣿⡟⣿⣟⣿⣿⣿⣟⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣭⣿⣿⠀⠀⠉⠉⢝⣋⠀⠀⣻⡿⠁⠀⡄⣀⠀⠙⢿⡧⠀⠩⣿⠉⠁⡀⠸⣯⣿⠀⣻⢿⣿⢿⣿⣿⣿⡷⣿⣿⢿⢿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣟⣿⣿⣿⣿⣿⣿⡟⣻⡿⣻⡿⣉⠀⢸⣿⣿⣟⣛⠀⠈⣛⡃⠀⣾⡾⣿⣧⠀⢸⡿⡆⠀⢹⠀⠀⠏⠀⠹⡿⠀⡿⣿⣿⣿⢿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣽⣿⣿⣿
⢿⣿⣿⣿⢿⣿⣿⣿⣿⣯⣿⣿⣷⣷⠿⡿⡿⣯⡯⠀⢸⣿⣿⡿⣿⠀⢨⣷⣇⠀⣽⡮⣛⡔⠀⢣⣿⣯⣦⠀⠀⢐⣽⣆⠀⠀⢸⣿⣿⣿⣿⣿⣿⡿⣿⣿⣿⣿⣷⣝⣿⣿⣿⣿⣿⣿
⣿⣟⣿⣿⣿⣿⣿⣿⣿⡿⣿⣿⣿⡿⣯⣿⡿⣿⡟⢀⡿⣿⣿⡿⡿⡀⡿⣿⣿⡀⠉⠋⠉⠀⣴⣿⡟⣿⣿⡦⣼⣾⣿⣿⣦⣿⣿⣿⣿⡿⠿⣿⣿⣿⣿⣿⣿⣟⣻⣿⣿⣿⣿⣿⡿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣽⣯⢯⣽⣟⣿⣿⣿⣾⣿⣟⣛⣿⣿⣷⣿⣿⣿⣿⣷⣦⣾⣾⣷⣷⣿⣿⣿⣿⣿⣿⣿⣿⡾⣿⣿⣿⣟⣿⣿⣟⣿⣻⣿⣿⣷⣿⣯⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣿⣿⣧⣷⣿⣿⣶⣿⣟⣿⢛⣿⣿⣿⣿⣿⣿⡯⣭⣻⣷⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣯⣣⣿⣿⣿⣿⣿⣳⣟⣿⣽⣯⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
```

## TicketFlow

## 🎯 The Problem & Our Solution

TicketFlow is an intelligent campus IT support system that solves a critical problem: overwhelming IT departments can't efficiently prioritize support requests manually. Our solution automates ticket triage using Google Gemini AI to instantly categorize and prioritize tickets, freeing your team to focus on actual resolution instead of administrative overhead.

**Built with:** ASP.NET Core (.NET 10) | MySQL | Google Gemini AI | Vanilla JavaScript

---

## 📺 Quick Start Visual

**What You Get:**
Students submit IT support tickets through an intuitive web dashboard. Type in your issue (e.g., "Laptop won't connect to WiFi"), submit, and our AI instantly routes it to the right queue with priority assigned. Support staff see all tickets sorted by urgency, update their status, and add resolution notes—all in one clean interface.

---

## 📊 UML Diagram

Below is the system architecture UML diagram showing the relationships between all major components:

![TicketFlow System UML Diagram](docs/uml-diagram.png)

**Key Components:**
- **Users** – Student and Admin roles with authentication
- **TicketsController** – REST API endpoint for ticket operations
- **ActiveTicket** – Model for current tickets in the system
- **PredictionService** – AI-powered categorization using Google Gemini
- **DatabaseHelper** – MySQL connection and query management
- **TicketArchive** – Historical records of resolved tickets
- **ResolutionNotes** – Detailed notes added by support staff
- **AuthController** – User authentication and password management

---

## ⚙️ Prerequisites & Installation

### System Requirements

Ensure you have these installed before proceeding:

- **ASP.NET Core SDK 10.0+** (download from https://dotnet.microsoft.com/download)
- **MySQL Server 8.0+** (community edition from https://www.mysql.com/)
- **Google Gemini API Key** (free tier at https://ai.google.dev/)
- **Git** (for cloning the repository)

### Step-by-Step Installation

**1. Clone the Repository**
```bash
git clone https://github.com/bercadets/Ticket-Flow.git
cd Ticket-Flow
```

**2. Restore Dependencies**
```bash
dotnet restore
```

**3. Create the Database**
```bash
mysql -u root -p
CREATE DATABASE SmartTicketingDB;
EXIT;
```

**4. Configure Your Gemini API Key**
```bash
dotnet user-secrets set "GeminiSettings:ApiKey" "your-api-key-here"
```

**5. Build the Application**
```bash
dotnet build
```

**6. Run the Application**
```bash
dotnet run
```

The application will start at `https://localhost:5001`. Open your browser and navigate there to access the dashboard.

---

## 🚀 Usage & Configuration

### Environment Variables

The application requires the following configuration (managed via user secrets and `appsettings.json`):

- `GeminiSettings:ApiKey` – Your Google Gemini API key for AI analysis (required, never commit this)
- `Database Connection String` – Located in `Services/DatabaseHelper.cs` (default: localhost, root user)

Update the connection string in `DatabaseHelper.cs` if using different MySQL credentials.

### Running the Application

**Development Mode:**
```bash
dotnet run
```
This enables hot-reload and provides detailed logging for debugging.

**Production Build:**
```bash
dotnet publish -c Release -o ./publish
```
Deploy the `publish` folder to your web server.

**Test the API:**
Once running, visit `https://localhost:5001/swagger` to explore all API endpoints with built-in Swagger documentation.

### Common Usage Scenarios

| Task | What to Do |
|------|-----------|
| **Submit a Ticket** | Go to dashboard → Fill the ticket form with issue description and location → Click "Submit" → AI routes it automatically |
| **Manage Active Tickets** | Log in as Admin → View all tickets sorted by priority → Update status or add notes |
| **Resolve & Archive** | Mark ticket as "Resolved" → Automatically moves to archive for historical records |
| **Reset Password** | Click "Forgot Password" → Verify identity → Set new password securely |

---

## ✨ Features

- **AI-Powered Categorization** – Google Gemini AI automatically assigns ticket category (Hardware, Network, Software)
- **Intelligent Priority Assignment** – AI determines urgency levels (Urgent, High Priority, Standard) based on issue description
- **Real-Time Dashboard** – Interactive interface for submitting, tracking, and managing tickets
- **Automatic Priority Sorting** – Active tickets displayed in priority queue for optimal triage efficiency
- **Secure User Authentication** – BCrypt password hashing with role-based access (Student/Admin)
- **Ticket Lifecycle Tracking** – Monitor tickets from Open → In Progress → Resolved → Archive
- **Password Reset Functionality** – Secure account recovery for users
- **RESTful API** – Fully documented endpoints with Swagger for easy integration
- **Database Persistence** – MySQL with automatic schema initialization on startup

---

---

## 👥 Team Members

This project was developed by:

| Role | Name |
|------|------|
| **Project Manager** | Davalos, Nicko Bryan J. |
| **Front End Developer** | Cueto, Carl John T. |
| **Backend Developer** | Abrigo, John Nathaniel F. |

---

## 📄 License

This project is licensed under the MIT License – see the LICENSE file for details.

## 💬 Support

For questions, issues, or contributions, please open an issue on the GitHub repository or contact the development team directly.
