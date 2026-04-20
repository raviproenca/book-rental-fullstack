import 'package:flutter/material.dart';

class Sidebar extends StatelessWidget {
  const Sidebar({super.key});

  void openSideBar(BuildContext context) {
    Scaffold.of(context).openDrawer();
  }

  @override
  Widget build(BuildContext context) {
    return NavigationDrawer(
      children: <Widget>[
        NavigationDrawerDestination(
          icon: Icon(Icons.home),
          label: Text('Home'),
        ),
        NavigationDrawerDestination(
          icon: Icon(Icons.person),
          label: Text('About'),
        ),
        NavigationDrawerDestination(
          icon: Icon(Icons.contact_mail),
          label: Text('Contact'),
        ),
      ],
    );
  }
}
