import 'package:flutter/material.dart';
import 'package:app_flutter/sidebar.dart';

class Header extends StatelessWidget {
  const Header({super.key});

  @override
  Widget build(BuildContext context) {
    return AppBar(
      leading: IconButton(
        onPressed: () => Sidebar().openSideBar(context),
        icon: Icon(Icons.menu),
        style: ButtonStyle(
          shape: WidgetStateProperty.all(
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(5)),
          ),
          backgroundColor: WidgetStateProperty.all(Colors.green),
        ),
      ),
      title: const Text(
        'Locadora de Livros',
        style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
      ),
      flexibleSpace: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFF004147), Color(0xFF009ead)],
          ),
        ),
      ),
      actions: <Widget>[
        IconButton(
          onPressed: () {},
          icon: const Icon(Icons.person_outline),
          style: ButtonStyle(
            iconSize: WidgetStateProperty.all(32),
            backgroundColor: WidgetStateProperty.all(Colors.white),
            foregroundColor: WidgetStateProperty.all(Colors.black),
          ),
        ),
      ],
    );
  }
}
