import 'package:app_flutter/inside_area.dart';
import 'package:flutter/material.dart';
import 'package:app_flutter/header.dart';
import 'package:app_flutter/sidebar.dart';

void main() {
  runApp(
    MaterialApp(
      home: Scaffold(
        appBar: const PreferredSize(
          preferredSize: Size.fromHeight(kToolbarHeight),
          child: Header(),
        ),
        drawer: const Sidebar(),
        body: Column(
          children: [
            Expanded(
              child: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xFFc4faff), Color(0xFF2aa9b5)],
                  ),
                ),
                child: Center(
                  child: Padding(
                    padding: EdgeInsets.all(16),
                    child: InsideArea(title: 'Users'),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    ),
  );
}
